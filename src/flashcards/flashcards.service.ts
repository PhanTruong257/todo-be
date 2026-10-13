import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flashcard, FlashcardDocument, FlashcardStatus } from './schemas/flashcard.schema.js';
import { CreateFlashcardDto } from './dto/create-flashcard.dto.js';
import { ReviewFlashcardDto, ReviewRating } from './dto/review-flashcard.dto.js';
import { SEED_FLASHCARDS } from './data/seed-flashcards.js';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectModel(Flashcard.name)
    private readonly flashcardModel: Model<FlashcardDocument>,
  ) {}

  /**
   * Lấy danh sách thẻ từ vựng với các bộ lọc
   */
  async findAll(query: {
    studentName?: string;
    topic?: string;
    level?: string;
    status?: string;
    dueOnly?: boolean;
    search?: string;
  }): Promise<Flashcard[]> {
    const filter: Record<string, any> = {};

    if (query.studentName && query.studentName !== 'all') {
      filter.$or = [
        { studentName: query.studentName },
        { studentName: 'all' },
      ];
    }

    if (query.topic && query.topic !== 'all') {
      filter.topic = query.topic;
    }

    if (query.level && query.level !== 'all') {
      filter.level = query.level;
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (query.dueOnly) {
      filter.nextReviewDate = { $lte: todayStr };
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { word: { $regex: term, $options: 'i' } },
        { meaningVi: { $regex: term, $options: 'i' } },
        { exampleEn: { $regex: term, $options: 'i' } },
      ];
    }

    return this.flashcardModel
      .find(filter)
      .sort({ nextReviewDate: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Lấy thống kê số lượng thẻ Flashcard theo tiến độ SRS
   */
  async getStats(studentName?: string): Promise<{
    totalCards: number;
    dueToday: number;
    newCards: number;
    learning: number;
    mastered: number;
    topics: string[];
  }> {
    const filter: Record<string, any> = {};
    if (studentName && studentName !== 'all') {
      filter.$or = [{ studentName }, { studentName: 'all' }];
    }

    const allCards = await this.flashcardModel.find(filter).exec();
    const todayStr = new Date().toISOString().split('T')[0];

    const dueToday = allCards.filter(
      (c) => !c.nextReviewDate || c.nextReviewDate <= todayStr,
    ).length;
    const newCards = allCards.filter((c) => c.status === FlashcardStatus.NEW).length;
    const learning = allCards.filter(
      (c) => c.status === FlashcardStatus.LEARNING,
    ).length;
    const mastered = allCards.filter(
      (c) => c.status === FlashcardStatus.MASTERED,
    ).length;

    const topicsSet = new Set<string>();
    allCards.forEach((c) => {
      if (c.topic) topicsSet.add(c.topic);
    });

    return {
      totalCards: allCards.length,
      dueToday,
      newCards,
      learning,
      mastered,
      topics: Array.from(topicsSet),
    };
  }

  /**
   * Tạo một thẻ từ vựng mới
   */
  async create(createDto: CreateFlashcardDto): Promise<Flashcard> {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCard = new this.flashcardModel({
      ...createDto,
      word: createDto.word.toLowerCase().trim(),
      nextReviewDate: todayStr,
      repetition: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      status: FlashcardStatus.NEW,
    });
    return newCard.save();
  }

  /**
   * Cập nhật thông tin thẻ
   */
  async update(id: string, updateDto: Partial<CreateFlashcardDto>): Promise<Flashcard> {
    const card = await this.flashcardModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!card) {
      throw new NotFoundException(`Không tìm thấy thẻ từ vựng với id ${id}`);
    }
    return card;
  }

  /**
   * Xóa thẻ từ vựng
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    const card = await this.flashcardModel.findByIdAndDelete(id).exec();
    if (!card) {
      throw new NotFoundException(`Không tìm thấy thẻ từ vựng với id ${id}`);
    }
    return { message: 'Đã xóa thẻ từ vựng thành công', id };
  }

  /**
   * Đánh giá ôn tập Flashcard theo thuật toán Lặp Lại Ngắt Quãng (SuperMemo-2 / SM-2)
   */
  async review(id: string, reviewDto: ReviewFlashcardDto): Promise<Flashcard> {
    const card = await this.flashcardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Không tìm thấy thẻ từ vựng với id ${id}`);
    }

    const { rating } = reviewDto;
    let { repetition, intervalDays, easeFactor } = card;

    // Đảm bảo giá trị khởi tạo hợp lệ
    if (typeof repetition !== 'number') repetition = 0;
    if (typeof intervalDays !== 'number') intervalDays = 0;
    if (typeof easeFactor !== 'number' || easeFactor < 1.3) easeFactor = 2.5;

    let newStatus = card.status;

    switch (rating) {
      case ReviewRating.AGAIN: {
        // Quên: Reset tiến độ ôn, ôn lại sau 1 ngày (hoặc ngay trong ngày)
        repetition = 0;
        intervalDays = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        newStatus = FlashcardStatus.LEARNING;
        break;
      }

      case ReviewRating.HARD: {
        // Khó nhớ: Giữ nguyên hoặc tăng nhẹ khoảng cách, giảm ease factor
        if (repetition === 0) {
          intervalDays = 1;
        } else {
          intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
        }
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        newStatus = FlashcardStatus.LEARNING;
        break;
      }

      case ReviewRating.GOOD: {
        // Nhớ tốt (chuẩn SM2):
        if (repetition === 0) {
          intervalDays = 1;
        } else if (repetition === 1) {
          intervalDays = 3;
        } else {
          intervalDays = Math.round(intervalDays * easeFactor);
        }
        repetition += 1;
        newStatus = repetition >= 4 ? FlashcardStatus.MASTERED : FlashcardStatus.LEARNING;
        break;
      }

      case ReviewRating.EASY: {
        // Quá dễ: Thưởng khoảng cách xa hơn và tăng ease factor
        if (repetition === 0) {
          intervalDays = 3;
        } else if (repetition === 1) {
          intervalDays = 6;
        } else {
          intervalDays = Math.round(intervalDays * easeFactor * 1.3);
        }
        repetition += 1;
        easeFactor = Math.min(3.0, easeFactor + 0.15);
        newStatus = repetition >= 3 ? FlashcardStatus.MASTERED : FlashcardStatus.LEARNING;
        break;
      }
    }

    // Tính ngày ôn tiếp theo = Hôm nay + intervalDays
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    const nextReviewDate = nextDate.toISOString().split('T')[0];

    card.repetition = repetition;
    card.intervalDays = intervalDays;
    card.easeFactor = easeFactor;
    card.nextReviewDate = nextReviewDate;
    card.lastReviewedAt = new Date();
    card.status = newStatus;

    return card.save();
  }

  /**
   * Khởi tạo bộ từ vựng mẫu (Seed Data)
   */
  async seed(studentName: string = 'all'): Promise<{ count: number; message: string }> {
    const todayStr = new Date().toISOString().split('T')[0];
    let addedCount = 0;

    for (const item of SEED_FLASHCARDS) {
      const existing = await this.flashcardModel.findOne({
        word: item.word.toLowerCase(),
        studentName,
      });

      if (!existing) {
        await this.flashcardModel.create({
          ...item,
          studentName,
          nextReviewDate: todayStr,
          repetition: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          status: FlashcardStatus.NEW,
        });
        addedCount++;
      }
    }

    return {
      count: addedCount,
      message: `Đã khởi tạo thành công ${addedCount} thẻ từ vựng chất lượng cao!`,
    };
  }

  /**
   * Tra từ tự động qua Free Dictionary API để lấy IPA, Audio, Meaning, Example
   */
  async lookup(word: string): Promise<{
    word: string;
    ipa: string;
    partOfSpeech: string;
    meaningEn: string;
    exampleEn: string;
    audioUrl: string;
  } | null> {
    try {
      const cleanWord = word.trim().toLowerCase();
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
        { signal: AbortSignal.timeout(4000) },
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const entry = data[0];
      let ipa = entry.phonetic || '';
      let audioUrl = '';

      if (Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (!ipa && p.text) ipa = p.text;
          if (p.audio && p.audio.trim()) {
            audioUrl = p.audio;
            break;
          }
        }
      }

      let partOfSpeech = 'noun';
      let meaningEn = '';
      let exampleEn = '';

      if (Array.isArray(entry.meanings) && entry.meanings.length > 0) {
        const m = entry.meanings[0];
        partOfSpeech = m.partOfSpeech || 'noun';
        if (Array.isArray(m.definitions) && m.definitions.length > 0) {
          meaningEn = m.definitions[0].definition || '';
          exampleEn = m.definitions[0].example || '';
        }
      }

      return {
        word: cleanWord,
        ipa,
        partOfSpeech,
        meaningEn,
        exampleEn,
        audioUrl,
      };
    } catch {
      return null;
    }
  }
}
