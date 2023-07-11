import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './achievement.entity';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectRepository(Achievement)
    private readonly repository: Repository<Achievement>,
  ) {}
  async findAll(): Promise<Achievement[]> {
    return await this.repository.find();
  }

  async findOneById(id: number): Promise<Achievement> {
    return await this.repository.findOne({ where: { id } });
  }

  async save(
    id: number,
    name: string,
    content: string,
    imageUrl: string,
  ): Promise<void> {
    await this.repository.save({ id, name, content, imageUrl });
  }
}
