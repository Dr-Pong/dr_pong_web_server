import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TouchLog } from './touch.log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TouchLogRepository {
  constructor(
    @InjectRepository(TouchLog)
    private readonly touchLogRepository: Repository<TouchLog>,
  ) {}

  async save(touchLog: TouchLog): Promise<TouchLog> {
    return await this.touchLogRepository.save(touchLog);
  }
}
