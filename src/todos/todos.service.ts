import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Todo, TodoDocument, TodoPriority } from './schemas/todo.schema.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const newTodo = new this.todoModel(createTodoDto);
    return newTodo.save();
  }

  async findAll(query?: {
    search?: string;
    status?: 'all' | 'active' | 'completed';
    priority?: string;
    studentName?: string;
  }): Promise<Todo[]> {
    const filter: Record<string, any> = {};

    if (query?.search && query.search.trim() !== '') {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { lessonContent: searchRegex },
        { studentName: searchRegex },
      ];
    }

    if (query?.status === 'active') {
      filter.isCompleted = false;
    } else if (query?.status === 'completed') {
      filter.isCompleted = true;
    }

    if (query?.priority && query.priority !== 'all') {
      filter.priority = query.priority;
    }

    if (query?.studentName && query.studentName !== 'all') {
      filter.studentName = query.studentName;
    }

    return this.todoModel
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .exec();
  }

  async getStudents(): Promise<string[]> {
    const distinct = await this.todoModel.distinct('studentName').exec();
    const list = Array.from(
      new Set(['Trường', 'Nguyệt', ...(distinct || []).filter(Boolean)]),
    );
    return list;
  }

  async findOne(id: string): Promise<Todo> {
    this.validateId(id);
    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    this.validateId(id);
    const updatedTodo = await this.todoModel
      .findByIdAndUpdate(id, { $set: updateTodoDto }, { new: true })
      .exec();

    if (!updatedTodo) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }
    return updatedTodo;
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    this.validateId(id);
    const deleted = await this.todoModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }
    return {
      message: 'Đã xóa công việc thành công',
      id,
    };
  }

  async toggle(id: string): Promise<Todo> {
    this.validateId(id);
    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }
    todo.isCompleted = !todo.isCompleted;
    return todo.save();
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    highPriority: number;
    studentStats: Record<string, { total: number; completed: number }>;
    students: string[];
  }> {
    const [total, completed, highPriority, distinctStudents, grouped] =
      await Promise.all([
        this.todoModel.countDocuments().exec(),
        this.todoModel.countDocuments({ isCompleted: true }).exec(),
        this.todoModel
          .countDocuments({ priority: TodoPriority.HIGH, isCompleted: false })
          .exec(),
        this.getStudents(),
        this.todoModel.aggregate([
          {
            $group: {
              _id: '$studentName',
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
              },
            },
          },
        ]),
      ]);

    const studentStats: Record<string, { total: number; completed: number }> =
      {};

    distinctStudents.forEach((name) => {
      studentStats[name] = { total: 0, completed: 0 };
    });

    grouped.forEach((g: any) => {
      const key = g._id || 'Khác';
      studentStats[key] = {
        total: g.total,
        completed: g.completed,
      };
    });

    return {
      total,
      active: total - completed,
      completed,
      highPriority,
      studentStats,
      students: distinctStudents,
    };
  }

  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID '${id}' không hợp lệ cho MongoDB`);
    }
  }
}
