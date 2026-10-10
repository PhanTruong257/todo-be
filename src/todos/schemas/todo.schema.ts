import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
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
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({
    type: String,
    enum: Object.values(TodoPriority),
    default: TodoPriority.MEDIUM,
  })
  priority: TodoPriority;

  @Prop({ type: Date, required: false })
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
