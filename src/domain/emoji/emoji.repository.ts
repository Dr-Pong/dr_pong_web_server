import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emoji } from './emoji.entity';

@Injectable()
export class EmojiRepository {
  constructor(
    @InjectRepository(Emoji)
    private readonly repository: Repository<Emoji>,
  ) {}
  async findAll(): Promise<Emoji[]> {
    return await this.repository.find();
  }
}
