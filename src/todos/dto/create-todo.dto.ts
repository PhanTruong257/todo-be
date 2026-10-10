import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';
import { TodoPriority } from '../schemas/todo.schema.js';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Tiêu đề công việc cần làm',
    example: 'Hoàn thành báo cáo tuần',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết công việc',
    example: 'Tổng hợp các task đã làm trong sprint và gửi cho PM',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Mức độ ưu tiên',
    enum: TodoPriority,
    default: TodoPriority.MEDIUM,
  })
  @IsEnum(TodoPriority, {
    message: 'Priority phải là low, medium, hoặc high',
  })
  @IsOptional()
  priority?: TodoPriority;

  @ApiPropertyOptional({
    description: 'Hạn chót hoàn thành (ISO Date String)',
    example: '2026-10-15T18:00:00.000Z',
  })
  @IsDateString({}, { message: 'dueDate phải đúng định dạng ISO date' })
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Danh sách nhãn phân loại (tags)',
    example: ['công việc', 'báo cáo'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
