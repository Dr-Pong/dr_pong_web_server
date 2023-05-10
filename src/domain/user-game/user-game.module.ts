import { Module } from '@nestjs/common';
import { UserGameService } from './user-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/domain/game/game.entity';
import { User } from 'src/domain/user/user.entity';
import { UserGame } from './user-game.entity';
import { UserRepository } from 'src/domain/user/user.repository';
import { UserGameRepository } from './user-game.repository';
import { Season } from 'src/domain/season/season.entity';
import { SeasonRepository } from 'src/domain/season/season.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserGame, Season])],
  providers: [
    UserGameRepository,
    UserGameService,
    SeasonRepository
  ],
  exports: [UserGameService],
})
export class UserGameModule { }
