import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ReviewRating {
  AGAIN = 'again', // Quên / không nhớ -> reset về ôn lại ngay
  HARD = 'hard',   // Nhớ mang máng / khó -> khoảng cách ngắn
  GOOD = 'good',   // Thuộc / đúng chuẩn -> tăng khoảng cách theo easeFactor
  EASY = 'easy',   // Quá dễ / thuộc làu -> tăng khoảng cách nhanh hơn
}

export class ReviewFlashcardDto {
  @ApiProperty({
    description: 'Đánh giá mức độ nhớ của người học theo chuẩn SRS',
    enum: ReviewRating,
    example: ReviewRating.GOOD,
  })
  @IsEnum(ReviewRating)
  @IsNotEmpty()
  rating: ReviewRating;

  @ApiPropertyOptional({
    description: 'Tên người học thực hiện đánh giá (Trường, Nguyệt)',
    example: 'Trường',
  })
  @IsString()
  @IsOptional()
  studentName?: string;
}
