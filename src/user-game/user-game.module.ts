import { Module } from '@nestjs/common';
import { UserGameService } from './user-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/game/game.entity';
import { User } from 'src/user/user.entity';
import { UserGame } from './user-game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, UserGame])],
  providers: [UserGameService],
  exports: [TypeOrmModule.forFeature([Game, User, UserGame])],
})
export class UserGameModule {}
