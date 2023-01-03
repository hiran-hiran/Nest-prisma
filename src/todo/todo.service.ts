import { ForbiddenException, Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  getTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getTaskById(userId: number, taskId: number): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        userId,
        id: taskId,
      },
    });
  }

  createTask(userId: number, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task
      .create({
        data: {
          userId,
          ...dto,
        },
      })
      .then((data) => data);
  }

  async updateTaskById(
    userId: number,
    taskId: number,
    dto: CreateTaskDto,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task || task.userId !== userId) {
      throw new ForbiddenException('Noe permission for update');
    }

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteTaskById(userId: number, taskId: number): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!task || task.userId !== userId) {
      throw new ForbiddenException('Noe permission for update');
    }

    await this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }
}
