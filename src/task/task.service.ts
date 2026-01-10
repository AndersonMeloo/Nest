import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindALLParameters, TaskDto, TaskStatusEnum } from './task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from 'src/db/entities/task.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  private tasks: TaskDto[] = [];

  async create(task: TaskDto) {
    const taskToSave: TaskEntity = {
      title: task.title,
      description: task.description,
      expirationDate: new Date(task.expirationDate),
      status: TaskStatusEnum.TO_DO,
    };

    const createdTask = await this.taskRepository.save(taskToSave);

    return this.mapEntityToDto(createdTask);
  }

  async findById(id: string): Promise<TaskDto> {
    const foundTask = await this.taskRepository.findOne({ where: { id } });
    if (!foundTask) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToDto(foundTask);
  }

  async findAll(params: FindALLParameters): Promise<TaskDto[]> {
    const searchParams: FindOptionsWhere<TaskEntity> = {};

    if (params.title) {
      searchParams.title = Like(`%${params.title}%`);
    }

    if (params.status) {
      searchParams.status = Like(`%${params.status}%`);
    }

    const tasksFound = await this.taskRepository.find({
      where: searchParams,
    });

    return tasksFound.map((taskEntity) => this.mapEntityToDto(taskEntity));
  }

  // Refactor findAll use taskEntity sql like

  async update(id: string, task: TaskDto) {
    const foundTask = await this.taskRepository.findOne({
      where: { id },
    });

    if (!foundTask) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.taskRepository.update(id, this.mapDtoToEntity(task));
  }
  //  refactor update id:string

  async remove(id: string) {
    const result = await this.taskRepository.delete(id);

    if (!result.affected) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // refactor remove  async await

  private mapEntityToDto(taskEntity: TaskEntity): TaskDto {
    if (!taskEntity.id) {
      throw new Error('TaskEntity sem id');
    }

    return {
      id: taskEntity.id,
      title: taskEntity.title,
      description: taskEntity.description,
      expirationDate: taskEntity.expirationDate.toISOString(),
      status: taskEntity.status as TaskStatusEnum,
    };
  }

  private mapDtoToEntity(taskDto: TaskDto): Partial<TaskEntity> {
    return {
      title: taskDto.title,
      description: taskDto.description,
      expirationDate: new Date(taskDto.expirationDate),
      status: taskDto.status?.toString(),
    };
  }
  // refactor create mapDtoToEntity
}
