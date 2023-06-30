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

    const game = new Game();
    game.season = currentSeason;
    game.playTime = endTime.getTime() - startTime.getTime();
    game.type = type;
    game.mode = mode;

    await this.repository.save(game);

    return game;
  }
}
