import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service.js';
import { CreateFlashcardDto } from './dto/create-flashcard.dto.js';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto.js';

@ApiTags('flashcards')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thẻ từ vựng mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  create(@Body() createFlashcardDto: CreateFlashcardDto) {
    return this.flashcardsService.create(createFlashcardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thẻ từ vựng (hỗ trợ lọc theo topic, level, SRS status, due)' })
  @ApiQuery({ name: 'studentName', required: false })
  @ApiQuery({ name: 'topic', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'dueOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('studentName') studentName?: string,
    @Query('topic') topic?: string,
    @Query('level') level?: string,
    @Query('status') status?: string,
    @Query('dueOnly') dueOnly?: string,
    @Query('search') search?: string,
  ) {
    return this.flashcardsService.findAll({
      studentName,
      topic,
      level,
      status,
      dueOnly: dueOnly === 'true',
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê số lượng thẻ cần ôn hôm nay và tổng quan' })
  @ApiQuery({ name: 'studentName', required: false })
  getStats(@Query('studentName') studentName?: string) {
    return this.flashcardsService.getStats(studentName);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Tra từ tự động qua Dictionary API (IPA, Audio, Meaning, Example)' })
  @ApiQuery({ name: 'word', required: true, description: 'Từ vựng tiếng Anh cần tra' })
  lookup(@Query('word') word: string) {
    return this.flashcardsService.lookup(word);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Khởi tạo bộ từ vựng mẫu IELTS / Oxford chất lượng cao' })
  @ApiQuery({ name: 'studentName', required: false })
  seed(@Query('studentName') studentName?: string) {
    return this.flashcardsService.seed(studentName || 'all');
  }

  @Post('review/:id')
  @ApiOperation({ summary: 'Đánh giá ôn tập Flashcard theo thuật toán SRS (Again, Hard, Good, Easy)' })
  @ApiParam({ name: 'id', description: 'ID của thẻ flashcard' })
  review(
    @Param('id') id: string,
    @Body() reviewFlashcardDto: ReviewFlashcardDto,
  ) {
    return this.flashcardsService.review(id, reviewFlashcardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật nội dung thẻ' })
  @ApiParam({ name: 'id', description: 'ID của thẻ' })
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateFlashcardDto>,
  ) {
    return this.flashcardsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thẻ từ vựng' })
  @ApiParam({ name: 'id', description: 'ID của thẻ' })
  remove(@Param('id') id: string) {
    return this.flashcardsService.remove(id);
  }
}
