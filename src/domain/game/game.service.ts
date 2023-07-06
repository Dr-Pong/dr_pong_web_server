import { Injectable } from '@nestjs/common';
import { Game } from 'src/domain/game/game.entity';
import { GameRepository } from './game.repository';
import { UserGameRepository } from '../user-game/user-game.repository';
import { PostGameDto } from './dto/post.game.dto';
import { TouchLogRepository } from '../touch-log/touch.log.repository';
import { SeasonRepository } from '../season/season.repository';
import { Season } from '../season/season.entity';
import { UserGame } from '../user-game/user-game.entity';
import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
  GameResultType,
} from 'src/global/type/type.game.result';
import { UserAchievementRepository } from '../user-achievement/user-achievement.repository';
import { UserTitleRepository } from '../user-title/user-title.repository';
import { UserRepository } from '../user/user.repository';
import {
  TIER_BACHELOR,
  TIER_DOCTOR,
  TIER_MASTER,
  TIER_STUDENT,
  TierType,
} from 'src/global/type/type.tier';
import { Ball } from '../touch-log/object/ball';
import { TouchLog } from '../touch-log/touch.log.entity';
import { GameEvent } from 'src/global/type/type.game.event';
import { AchievementRepository } from '../achievement/achievement.repository';
import { UserAchievement } from '../user-achievement/user-achievement.entity';
import { Achievement } from '../achievement/achievement.entity';
import {
  UpDateUserAchievementDto,
  UserAchievementsDto,
} from '../user-achievement/dto/update.user.achievement.dto';
import { RankRepository } from '../rank/rank.repository';
import { Rank } from '../rank/rank.entity';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userGameRepository: UserGameRepository,
    private readonly touchLogRepository: TouchLogRepository,
    private readonly seasonRepository: SeasonRepository,
    private readonly userAchievementRepository: UserAchievementRepository,
    private readonly achievementRepository: AchievementRepository,
    private readonly rankRepository: RankRepository,
    private readonly userTitleRepository: UserTitleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async postGame(postGameDto: PostGameDto): Promise<void> {
    const { player1, player2 } = postGameDto;
    const currentSeason: Season =
      await this.seasonRepository.findCurrentSeason();

    const game: Game = await this.saveGame(postGameDto, currentSeason);

    const player1Result: GameResultType = this.checkGameResult(
      player1.score,
      player2.score,
    );
    const player2Result: GameResultType = this.checkGameResult(
      player2.score,
      player1.score,
    );

    const user1Rank: Rank = await this.rankRepository.findByUserIdAndSeasonId(
      player1.id,
      currentSeason.id,
    );
    const user2Rank: Rank = await this.rankRepository.findByUserIdAndSeasonId(
      player2.id,
      currentSeason.id,
    );

    const user1Lp = user1Rank.ladderPoint + player1.lpChange;
    const user2Lp = user2Rank.ladderPoint + player2.lpChange;
    await this.rankRepository.update(player1.id, currentSeason.id, user1Lp);
    await this.rankRepository.update(player2.id, currentSeason.id, user2Lp);

    const userGame1: UserGame = await this.saveUserGames(
      game,
      player1,
      player1Result,
      user1Lp,
    );
    const userGame2: UserGame = await this.saveUserGames(
      game,
      player2,
      player2Result,
      user2Rank.ladderPoint,
    );

    const logs = postGameDto.logs;
    for (const log of logs) {
      const userGame: UserGame =
        player1.id === log.userId ? userGame1 : userGame2;
      await this.saveTouchLog(userGame, log.event, log.round, log.ball);
    }

    await this.updateAchievementsAndTitles(
      player1.id,
      player2.id,
      currentSeason.id,
      user1Rank.ladderPoint,
      user2Rank.ladderPoint,
    );
  }

  async saveGame(
    postGameDto: PostGameDto,
    currentSeason: Season,
  ): Promise<Game> {
    return this.gameRepository.save(postGameDto, currentSeason);
  }

  async saveUserGames(
    game: Game,
    player: any,
    result: GameResultType,
    userLP: number,
  ): Promise<UserGame> {
    return this.userGameRepository.save(player, game, result, userLP);
  }

  async saveTouchLog(
    userGame: UserGame,
    event: GameEvent,
    round: number,
    ball: Ball,
  ): Promise<TouchLog> {
    return this.touchLogRepository.save(userGame, event, round, ball);
  }

  async updateAchievementsAndTitles(
    player1Id: number,
    player2Id: number,
    currentSeasonId: number,
    player1LP: number,
    player2LP: number,
  ): Promise<UserAchievementsDto> {
    const player1Games: UserGame[] =
      await this.userGameRepository.findAllByUserId(player1Id);
    const player2Games: UserGame[] =
      await this.userGameRepository.findAllByUserId(player2Id);

    const player1Achievements: UserAchievement[] =
      await this.userAchievementRepository.findAllByUserId(player1Id);
    const player2Achievements: UserAchievement[] =
      await this.userAchievementRepository.findAllByUserId(player2Id);

    const achievements: Achievement[] =
      await this.achievementRepository.findAll();

    const player1WinCount = player1Games.filter(
      (userGame: UserGame) => userGame.result === GAMERESULT_WIN,
    ).length;
    const player2WinCount = player2Games.filter(
      (userGame: UserGame) => userGame.result === GAMERESULT_WIN,
    ).length;

    const updatedUserAchievements: UserAchievementsDto =
      new UserAchievementsDto();
    updatedUserAchievements.updateAchievements = [];

    if (player1Achievements.length !== achievements.length) {
      switch (player1WinCount) {
        case 1: {
          await this.userAchievementRepository.save(
            player1Id,
            achievements[0].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpDateUserAchievementDto(player1Id, achievements[0].id),
          );
          break;
        }
        case 2: {
          await this.userAchievementRepository.save(
            player1Id,
            achievements[1].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpDateUserAchievementDto(player1Id, achievements[1].id),
          );
          break;
        }
        case 10: {
          await this.userAchievementRepository.save(
            player1Id,
            achievements[2].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpDateUserAchievementDto(player1Id, achievements[2].id),
          );
          break;
        }
        default:
          break;
      }
    }

    if (player2Achievements.length !== achievements.length) {
      switch (player2WinCount) {
        case 1: {
          await this.userAchievementRepository.save(
            player2Id,
            achievements[0].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpDateUserAchievementDto(player2Id, achievements[0].id),
          );
          break;
        }
        case 2: {
          await this.userAchievementRepository.save(
            player2Id,
            achievements[1].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpDateUserAchievementDto(player2Id, achievements[1].id),
          );
          break;
        }
        case 10: {
          await this.userAchievementRepository.save(
            player2Id,
            achievements[2].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpDateUserAchievementDto(player2Id, achievements[2].id),
          );
          break;
        }
        default:
          break;
      }
    }

    // lp변화에 따른 업적
    let player1ChangedLp: number = player1LP;
    let player2ChangedLp: number = player2LP;
    for (let i = 0; i < player1Games.length; i++) {
      player1ChangedLp = player1LP + player1Games[i].lpChange;
    }
    for (let i = 0; i < player2Games.length; i++) {
      player2ChangedLp = player2LP + player2Games[i].lpChange;
    }
    const player1Tier: TierType = await this.checkTier(player1ChangedLp);
    const player2Tier: TierType = await this.checkTier(player2ChangedLp);
    if (player1Tier) {
      const player1AchievementId = getAchievementByLPCut(player1ChangedLp);
      const hasAchievement = player1Achievements.some(
        (achievement) => achievement.achievement.id === player1AchievementId,
      );
      if (!hasAchievement) {
        await this.userAchievementRepository.save(
          player1Id,
          player1AchievementId,
        );
        updatedUserAchievements.updateAchievements.push(
          new UpDateUserAchievementDto(player1Id, player1AchievementId),
        );
      }
    }

    if (player2Tier) {
      const player2AchievementId = getAchievementByLPCut(player2LP);
      const hasAchievement = player2Achievements.some(
        (achievement) => achievement.achievement.id === player2AchievementId,
      );
      if (!hasAchievement) {
        await this.userAchievementRepository.save(
          player2Id,
          player2AchievementId,
        );
        updatedUserAchievements.updateAchievements.push(
          new UpDateUserAchievementDto(player2Id, player2AchievementId),
        );
      }
    }

    function getAchievementByLPCut(lp: number): number {
      switch (true) {
        case lp >= Number(process.env.DOCTOR_CUT):
          return achievements[6].id;
        case lp >= Number(process.env.MASTER_CUT):
          return achievements[5].id;
        case lp >= Number(process.env.BACHELOR_CUT):
          return achievements[4].id;
        case lp >= Number(process.env.STUDENT_CUT):
          return achievements[3].id;
      }
    }

    return updatedUserAchievements;
  }

  private checkGameResult(
    player1Score: number,
    player2Score: number,
  ): GameResultType {
    if (player1Score > player2Score) {
      return GAMERESULT_WIN;
    } else if (player1Score < player2Score) {
      return GAMERESULT_LOSE;
    } else {
      return GAMERESULT_TIE;
    }
  }

  async checkTier(playerLP: number): Promise<TierType> {
    if (playerLP >= Number(process.env.DOCTOR_CUT)) {
      return TIER_DOCTOR;
    } else if (playerLP >= Number(process.env.MASTER_CUT)) {
      return TIER_MASTER;
    } else if (playerLP >= Number(process.env.BACHELOR_CUT)) {
      return TIER_BACHELOR;
    } else if (playerLP >= Number(process.env.STUDENT_CUT)) {
      return TIER_STUDENT;
    }
  }
}
