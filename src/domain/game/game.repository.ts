import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Repository } from 'typeorm';
import { PostGameDto } from './dto/post.game.dto';
import { Season } from '../season/season.entity';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly repository: Repository<Game>,
  ) {}

  async save(postDto: PostGameDto, currentSeason: Season): Promise<Game> {
    const { mode, type, startTime, endTime } = postDto;
    return await this.repository.save({
      season: currentSeason,
      playTime: endTime.getTime() - startTime.getTime(),
      type,
      mode,
    });
  }
}
