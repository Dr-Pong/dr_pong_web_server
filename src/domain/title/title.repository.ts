import { Injectable } from '@nestjs/common';
import { Title } from './title.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TitleRepository {
  constructor(
    @InjectRepository(Title)
    private readonly repository: Repository<Title>,
  ) {}

  async findAll(): Promise<Title[]> {
    return await this.repository.find();
  }

  async findOneById(id: number): Promise<Title> {
    return await this.repository.findOne({ where: { id } });
  }

  async save(id: number, name: string, content: string): Promise<Title> {
    return await this.repository.save({
      id,
      name,
      content,
    });
  }
}
