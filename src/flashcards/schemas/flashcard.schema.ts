import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlashcardDocument = Flashcard & Document;

export enum FlashcardStatus {
  NEW = 'new',
  LEARNING = 'learning',
  MASTERED = 'mastered',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Flashcard {
  @Prop({ required: true, trim: true, lowercase: true })
  word: string;

  @Prop({ default: '', trim: true })
  ipa: string;

  @Prop({ default: 'noun', trim: true })
  partOfSpeech: string;

  @Prop({ required: true, trim: true })
  meaningVi: string;

  @Prop({ default: '', trim: true })
  meaningEn: string;

  @Prop({ default: '', trim: true })
  exampleEn: string;

  @Prop({ default: '', trim: true })
  exampleVi: string;

  @Prop({ default: '', trim: true })
  audioUrl: string;

  @Prop({ default: 'IELTS Core', trim: true })
  topic: string;

  @Prop({ default: 'B2', trim: true })
  level: string;

  @Prop({ default: 'all', trim: true })
  studentName: string;

  // --- Spaced Repetition (SRS - SM2) Tracking ---
  @Prop({ default: 0 })
  repetition: number;

  @Prop({ default: 0 })
  intervalDays: number;

  @Prop({ default: 2.5 })
  easeFactor: number;

  @Prop({ default: () => new Date().toISOString().split('T')[0] })
  nextReviewDate: string;

  @Prop({ type: Date, required: false })
  lastReviewedAt?: Date;

  @Prop({
    type: String,
    enum: Object.values(FlashcardStatus),
    default: FlashcardStatus.NEW,
  })
  status: FlashcardStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

// Tạo index để tìm kiếm nhanh theo word, topic, nextReviewDate, studentName
FlashcardSchema.index({ word: 1, studentName: 1 });
FlashcardSchema.index({ nextReviewDate: 1 });
FlashcardSchema.index({ topic: 1 });
