import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserGame } from './user-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserGameRecordsDto } from './dto/get.user-game.records.dto';
import { FindUserGameSeasonStatDto } from './dto/find.user-game.season.stat.dto';
import { Game } from '../game/game.entity';
import { GameResultType } from 'src/global/type/type.game.result';
import { Rank } from '../rank/rank.entity';

@Injectable()
export class UserGameRepository {
  constructor(
    @InjectRepository(UserGame)
    private readonly repository: Repository<UserGame>,
    @InjectRepository(Rank)
    private readonly rankRepository: Repository<Rank>,
  ) {}

  async findAllByUserId(userId: number): Promise<UserGame[]> {
    return await this.repository.find({
      where: { user: { id: userId } },
      loadEagerRelations: false,
    });
  }

  async findAllByUserIdAndSeasonId(
    getDto: FindUserGameSeasonStatDto,
  ): Promise<UserGame[]> {
    return await this.repository.find({
      where: {
        user: { id: getDto.userId },
        game: { season: { id: getDto.seasonId } },
      },
      loadEagerRelations: false,
    });
  }

  async findAllByUserIdAndGameIdLowerThanLastGameId(
    getDto: GetUserGameRecordsDto,
  ): Promise<UserGame[]> {
    const gameIds = this.repository
      .createQueryBuilder('user_game')
      .select('user_game.game_id')
      .where(
        'user_game.user_id = :userId and user_game.game_id < :lastGameId',
        { userId: getDto.userId, lastGameId: getDto.lastGameId },
      )
      .orderBy({ 'game.start_time': 'DESC', 'user_game.game.id': 'DESC' })
      .limit(getDto.count + 1);

    const userGames: UserGame[] = await this.repository
      .createQueryBuilder('user_game')
      .leftJoinAndSelect('user_game.game', 'game')
      .leftJoinAndSelect('user_game.user', 'user')
      .leftJoinAndSelect('user.image', 'image')
      .where(`user_game.game_id IN (${gameIds.getQuery()})`)
      .setParameters(gameIds.getParameters())
      .orderBy({ 'game.start_time': 'DESC', 'user_game.game.id': 'DESC' })
      .getMany();

    return userGames;
  }

  async findTwoUserGameByGameId(gameId: number): Promise<UserGame[]> {
    const userGames = await this.repository.find({
      where: {
        game: { id: gameId },
      },
    });
    return userGames;
  }

  async save(
    player: { id: number; score: number; lpChange: number; lpResult: number },
    game: Game,
    result: GameResultType,
    userLp: number,
  ): Promise<UserGame> {
    return await this.repository.save({
      user: { id: player.id },
      game: { id: game.id },
      result: result,
      score: player.score,
      lpChange: player.lpChange,
      lpResult: userLp,
    });
  }
}
