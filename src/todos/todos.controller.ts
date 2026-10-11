import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TodosService } from './todos.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới một công việc' })
  @ApiResponse({ status: 201, description: 'Tạo công việc thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công việc / báo cáo (có tìm kiếm và lọc)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tiêu đề hoặc mô tả hoặc nội dung' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'completed'], description: 'Trạng thái công việc' })
  @ApiQuery({ name: 'priority', required: false, enum: ['all', 'low', 'medium', 'high'], description: 'Mức độ ưu tiên' })
  @ApiQuery({ name: 'studentName', required: false, description: 'Lọc theo tên người học (ví dụ: Trường, Nguyệt)' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: 'all' | 'active' | 'completed',
    @Query('priority') priority?: string,
    @Query('studentName') studentName?: string,
  ) {
    return this.todosService.findAll({ search, status, priority, studentName });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê số lượng công việc và tiến độ từng người học' })
  getStats() {
    return this.todosService.getStats();
  }

  @Get('students')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người học' })
  getStudents() {
    return this.todosService.getStudents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một công việc theo ID' })
  @ApiParam({ name: 'id', description: 'ID MongoDB của công việc' })
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin công việc' })
  @ApiParam({ name: 'id', description: 'ID MongoDB của công việc' })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Đảo ngược trạng thái hoàn thành (Toggle complete)' })
  @ApiParam({ name: 'id', description: 'ID MongoDB của công việc' })
  toggle(@Param('id') id: string) {
    return this.todosService.toggle(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa một công việc' })
  @ApiParam({ name: 'id', description: 'ID MongoDB của công việc' })
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
