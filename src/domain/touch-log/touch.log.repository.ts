import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TouchLog } from './touch.log.entity';
import { Repository } from 'typeorm';
import { GameEvent } from 'src/global/type/type.game.event';
import { Ball } from './object/ball';
import { UserGame } from '../user-game/user-game.entity';

@Injectable()
export class TouchLogRepository {
  constructor(
    @InjectRepository(TouchLog)
    private readonly touchLogRepository: Repository<TouchLog>,
  ) {}

  async save(
    userGame: UserGame,
    event: GameEvent,
    round: number,
    ball: Ball,
  ): Promise<TouchLog> {
    return await this.touchLogRepository.save({
      userGame,
      event,
      round,
      ballSpeed: ball.speed,
      ballDirectionX: ball.direction.x,
      ballDirectionY: ball.direction.y,
      ballPositionX: ball.position.x,
      ballPositionY: ball.position.y,
      ballSpinSpeed: ball.spinSpeed,
    });
  }

  async findAllByUserGameId(userGameId: number): Promise<TouchLog[]> {
    return await this.touchLogRepository.find({
      where: { userGame: { id: userGameId } },
    });
  }
}
