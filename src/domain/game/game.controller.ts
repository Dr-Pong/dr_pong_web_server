import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { PostGameDto } from './dto/post.game.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async gamePost(@Body() postGameDto: PostGameDto) {
    await this.gameService.postGame(postGameDto);
  }
}
