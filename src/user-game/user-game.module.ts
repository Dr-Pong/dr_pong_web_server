import { Module } from '@nestjs/common';
import { UserGameService } from './user-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/game/game.entity';
import { User } from 'src/user/user.entity';
import { UserGame } from './user-game.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Game, UserGame])],
  providers: [
    UserGameService,
    UserGameRepository,
    GameRepository,
    UserRepository,
  ],
  exports: [UserGameService],
})
export class UserGameModule {}
