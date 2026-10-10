import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';
import { TodoPriority } from '../schemas/todo.schema.js';

export class UpdateTodoDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề công việc cần làm',
    example: 'Hoàn thành báo cáo tuần đã sửa',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết công việc',
    example: 'Chi tiết cập nhật thêm',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoàn thành',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Mức độ ưu tiên',
    enum: TodoPriority,
    example: TodoPriority.HIGH,
  })
  @IsEnum(TodoPriority, {
    message: 'Priority phải là low, medium, hoặc high',
  })
  @IsOptional()
  priority?: TodoPriority;

  @ApiPropertyOptional({
    description: 'Hạn chót hoàn thành (ISO Date String)',
    example: '2026-10-20T18:00:00.000Z',
  })
  @IsDateString({}, { message: 'dueDate phải đúng định dạng ISO date' })
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Danh sách nhãn phân loại (tags)',
    example: ['khẩn cấp'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
