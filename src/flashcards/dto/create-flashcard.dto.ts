import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFlashcardDto {
  @ApiProperty({ description: 'Từ vựng tiếng Anh', example: 'resilient' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiPropertyOptional({ description: 'Phiên âm IPA', example: '/rɪˈzɪl.jənt/' })
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiPropertyOptional({ description: 'Loại từ', example: 'adjective' })
  @IsString()
  @IsOptional()
  partOfSpeech?: string;

  @ApiProperty({ description: 'Nghĩa tiếng Việt', example: 'kiên cường, có khả năng phục hồi nhanh' })
  @IsString()
  @IsNotEmpty()
  meaningVi: string;

  @ApiPropertyOptional({ description: 'Định nghĩa tiếng Anh' })
  @IsString()
  @IsOptional()
  meaningEn?: string;

  @ApiPropertyOptional({ description: 'Câu ví dụ tiếng Anh', example: 'She is resilient in the face of adversity.' })
  @IsString()
  @IsOptional()
  exampleEn?: string;

  @ApiPropertyOptional({ description: 'Câu ví dụ tiếng Việt', example: 'Cô ấy rất kiên cường khi đối mặt nghịch cảnh.' })
  @IsString()
  @IsOptional()
  exampleVi?: string;

  @ApiPropertyOptional({ description: 'Link phát âm audio MP3' })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ description: 'Chủ đề', example: 'IELTS Core' })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional({ description: 'Cấp độ CEFR (A1, A2, B1, B2, C1, C2)', example: 'B2' })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({ description: 'Thành viên học (Trường, Nguyệt, all)', example: 'all' })
  @IsString()
  @IsOptional()
  studentName?: string;
}
