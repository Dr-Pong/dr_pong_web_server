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
    const startTimeTimestamp = new Date(startTime).getTime();

    const game = new Game();
    game.season = currentSeason;
    game.startTime = new Date(startTimeTimestamp);
    game.playTime = new Date(endTime).getTime() - startTimeTimestamp;
    game.type = type;
    game.mode = mode;

    return await this.repository.save(game);
  }
}
