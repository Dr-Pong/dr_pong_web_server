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
  UpdateUserAchievementDto,
  UpdateUserAchievementsDto,
} from '../user-achievement/dto/update.user.achievement.dto';
import { RankRepository } from '../rank/rank.repository';
import { Rank } from '../rank/rank.entity';
import { User } from '../user/user.entity';
import { TitleRepository } from '../title/title.repository';
import { Title } from '../title/title.entity';
import {
  UpdateUserTitleDto,
  UpdateUserTitlesDto,
} from '../user-title/dto/update.user.title.dto';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { PostGameResponseDto } from './dto/post.game.response.dto';

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
    private readonly titleRepository: TitleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async postGame(postGameDto: PostGameDto): Promise<PostGameResponseDto> {
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

    const usersAchievements: UpdateUserAchievementsDto =
      await this.updateAchievements(
        player1.id,
        player2.id,
        currentSeason.id,
        user1Rank.ladderPoint,
        user2Rank.ladderPoint,
      );

    const usersTitles: UpdateUserTitlesDto = await this.updateUserLevel(
      player1.id,
      player2.id,
      player1Result,
      player2Result,
    );

    const responseDto: PostGameResponseDto = {
      achievement: usersAchievements,
      title: usersTitles,
    };
    return responseDto;
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

  async updateAchievements(
    player1Id: number,
    player2Id: number,
    seasonId: number,
    player1LP: number,
    player2LP: number,
  ): Promise<UpdateUserAchievementsDto> {
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

    const updatedUserAchievements: UpdateUserAchievementsDto =
      new UpdateUserAchievementsDto();
    updatedUserAchievements.updateAchievements = [];

    if (player1Achievements.length !== achievements.length) {
      switch (player1WinCount) {
        case 1: {
          await this.userAchievementRepository.save(
            player1Id,
            achievements[0].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpdateUserAchievementDto(player1Id, achievements[0].id),
          );
          break;
        }
        case 8: {
          await this.userAchievementRepository.save(
            player1Id,
            achievements[1].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpdateUserAchievementDto(player1Id, achievements[1].id),
          );
          break;
        }
        case 10: {
          await this.userAchievementRepository.save(
            player1Id,
            achievements[2].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpdateUserAchievementDto(player1Id, achievements[2].id),
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
            new UpdateUserAchievementDto(player2Id, achievements[0].id),
          );
          break;
        }
        case 8: {
          await this.userAchievementRepository.save(
            player2Id,
            achievements[1].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpdateUserAchievementDto(player2Id, achievements[1].id),
          );
          break;
        }
        case 10: {
          await this.userAchievementRepository.save(
            player2Id,
            achievements[2].id,
          );
          updatedUserAchievements.updateAchievements.push(
            new UpdateUserAchievementDto(player2Id, achievements[2].id),
          );
          break;
        }
        default:
          break;
      }
    }
    const user1Rank: Rank = await this.rankRepository.findByUserIdAndSeasonId(
      player1Id,
      seasonId,
    );

    const user2Rank: Rank = await this.rankRepository.findByUserIdAndSeasonId(
      player2Id,
      seasonId,
    );

    const player1ChangedLp = user1Rank.ladderPoint;
    const player2ChangedLp = user2Rank.ladderPoint;

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
          new UpdateUserAchievementDto(player1Id, player1AchievementId),
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
          new UpdateUserAchievementDto(player2Id, player2AchievementId),
        );
      }
    }

    function getAchievementByLPCut(lp: number): number {
      switch (true) {
        case lp >= Number(process.env.DOCTOR_CUT):
          return achievements[6]?.id;
        case lp >= Number(process.env.MASTER_CUT):
          return achievements[5]?.id;
        case lp >= Number(process.env.BACHELOR_CUT):
          return achievements[4]?.id;
        case lp >= Number(process.env.STUDENT_CUT):
          return achievements[3]?.id;
      }
    }

    return updatedUserAchievements;
  }

  async updateUserLevel(
    player1Id: number,
    player2Id: number,
    player1Result: GameResultType,
    player2Result: GameResultType,
  ): Promise<UpdateUserTitlesDto> {
    const titles = await this.titleRepository.findAll();
    const player1: User = await this.userRepository.findById(player1Id);
    const player2: User = await this.userRepository.findById(player2Id);

    // player1의 레벨 업 체크 및 경험치 추가
    const player1Exp = this.calculateExperiencePoints(player1Result);
    const player1Level = this.calculateLevel(player1, player1Exp);
    await this.userRepository.update(player1.id, player1Exp, player1Level);
    const updatedPlayer1: User = await this.userRepository.findById(player1Id);
    this.updateTitle(updatedPlayer1, titles);

    // player2의 레벨 업 체크 및 경험치 추가
    const player2Exp = this.calculateExperiencePoints(player2Result);
    const player2Level = this.calculateLevel(player2, player2Exp);
    await this.userRepository.update(player2.id, player2Exp, player2Level);
    const updatedPlayer2: User = await this.userRepository.findById(player2Id);
    this.updateTitle(updatedPlayer2, titles);

    // 업데이트된 유저 타이틀 정보를 반환합니다.
    const updateUserTitles: UpdateUserTitlesDto = new UpdateUserTitlesDto();
    updateUserTitles.updateUserTitles = [];

    const updatePlayerTitles = (player: User) => {
      if (player.level >= 10) {
        updateUserTitles.updateUserTitles.push(
          new UpdateUserTitleDto(player.id, titles[0].id),
        );
      }
      if (player.level >= 42) {
        updateUserTitles.updateUserTitles.push(
          new UpdateUserTitleDto(player.id, titles[1].id),
        );
      }
      if (player.level >= 100) {
        updateUserTitles.updateUserTitles.push(
          new UpdateUserTitleDto(player.id, titles[2].id),
        );
      }
    };

    updatePlayerTitles(updatedPlayer1);
    updatePlayerTitles(updatedPlayer2);

    return updateUserTitles;
  }

  private async updateTitle(player: User, titles: Title[]): Promise<void> {
    const playerLevel = player.level;
    if (playerLevel >= 100) {
      await this.userTitleRepository.save(player.id, titles[2].id);
    } else if (playerLevel >= 42) {
      await this.userTitleRepository.save(player.id, titles[1].id);
    } else if (playerLevel >= 10) {
      await this.userTitleRepository.save(player.id, titles[0].id);
    }
  }

  private calculateExperiencePoints(playerResult: GameResultType): number {
    const exp = playerResult === GAMERESULT_WIN ? 20 : 10; // player가 이겼을 때는 20점, 아닐 때는 10점
    return exp;
  }

  private calculateLevel(player: User, exp: number): number {
    const playerExp = player.exp;
    exp += playerExp;
    const level = Math.floor(exp / 100);
    return level;
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
