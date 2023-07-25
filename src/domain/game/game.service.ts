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
import { UserTitle } from '../user-title/user-title.entity';
import { GAMETYPE_NORMAL, GAMETYPE_RANK, GameType } from 'src/global/type/type.game';

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
    const { player1, player2 , type} = postGameDto;
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

    const user1Lp = Math.max(user1Rank.ladderPoint + player1.lpChange, 0);
    const user2Lp = Math.max(user2Rank.ladderPoint + player2.lpChange, 0);
    await this.updateRank(player1.id, currentSeason.id, user1Lp);
    await this.updateRank(player2.id, currentSeason.id, user2Lp);

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
      user2Lp,
    );

    const logs = postGameDto.logs;
    for (const log of logs) {
      const userGame: UserGame =
        player1.id === log.userId ? userGame1 : userGame2;
      await this.saveTouchLog(userGame, log.event, log.round, log.ball);
    }

    const usersAchievements: UpdateUserAchievementsDto =
      await this.updateAchievements(player1.id, player2.id, currentSeason.id, type);

    const usersTitles: UpdateUserTitlesDto = await this.updateUserLevel(
      player1.id,
      player2.id,
      player1Result,
      player2Result,
    );

    const responseDto: PostGameResponseDto = {
      achievement: usersAchievements.updateAchievements,
      title: usersTitles.updateUserTitles,
    };
    return responseDto;
  }

  async updateRank(userId: number, seasonId: number, userLp: number) {
    const userHighestRank: Rank =
      await this.rankRepository.findHighestRankByUserId(userId);
    let userHighestLp: number;
    if (userHighestRank.ladderPoint <= userLp) {
      userHighestLp = userLp;
    } else {
      userHighestLp = userHighestRank.highestPoint;
    }
    await this.rankRepository.update(userId, seasonId, userLp, userHighestLp);
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
    type: GameType,
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
      const achievementMapping = [
        { winCount: 1, achievementIndex: 0 },
        { winCount: 8, achievementIndex: 1 },
        { winCount: 10, achievementIndex: 2 },
      ];

      for (const mapping of achievementMapping) {
        if (player1WinCount === mapping.winCount) {
          const achievementId = achievements[mapping.achievementIndex]?.id;
          const hasAchievement = player1Achievements.some(
            (achievement) => achievement.achievement.id === achievementId
          );
  
          if (!hasAchievement) {
            const achievement = achievements[mapping.achievementIndex]?.name;
            const imageUrl = achievements[mapping.achievementIndex]?.imageUrl;
            await this.userAchievementRepository.save(player1Id, achievementId);
            updatedUserAchievements.updateAchievements.push(
              new UpdateUserAchievementDto(player1Id, achievement, imageUrl)
            );
          }
  
          break;
        }
      }
    }

    if (player2Achievements.length !== achievements.length) {
      const achievementMapping = [
        { winCount: 1, achievementIndex: 0 },
        { winCount: 8, achievementIndex: 1 },
        { winCount: 10, achievementIndex: 2 },
      ];

      for (const mapping of achievementMapping) {
        if (player2WinCount === mapping.winCount) {
          const achievementId = achievements[mapping.achievementIndex]?.id;
          const hasAchievement = player2Achievements.some(
            (achievement) => achievement.achievement.id === achievementId
          );
  
          if (!hasAchievement) {
            const achievement = achievements[mapping.achievementIndex]?.name;
            const imageUrl = achievements[mapping.achievementIndex]?.imageUrl;
            await this.userAchievementRepository.save(player2Id, achievementId);
            updatedUserAchievements.updateAchievements.push(
              new UpdateUserAchievementDto(player2Id, achievement, imageUrl)
            );
          }
  
          break;
        }
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
    if (player1Tier && type === GAMETYPE_RANK) {
      const player1AchievementId = getAchievementByLPCut(player1ChangedLp);
      const hasAchievement = player1Achievements.some(
        (achievement) => achievement.achievement.id === player1AchievementId,
      );
      if (!hasAchievement) {
        await this.userAchievementRepository.save(
          player1Id,
          player1AchievementId,
        );
        const player1Achievement = achievements.find(
          (achievement) => achievement.id === player1AchievementId,
        )?.name;
        const player1AchievementImageUrl = achievements.find(
          (achievement) => achievement.id === player1AchievementId,
        )?.imageUrl;
        updatedUserAchievements.updateAchievements.push(
          new UpdateUserAchievementDto(
            player1Id,
            player1Achievement,
            player1AchievementImageUrl,
          ),
        );
      }
    }

    if (player2Tier && type === GAMETYPE_RANK) {
      const player2AchievementId = getAchievementByLPCut(player2ChangedLp);
      const hasAchievement = player2Achievements.some(
        (achievement) => achievement.achievement.id === player2AchievementId,
      );
      if (!hasAchievement) {
        await this.userAchievementRepository.save(
          player2Id,
          player2AchievementId,
        );
        const player2Achievement = achievements.find(
          (achievement) => achievement.id === player2AchievementId,
        )?.name;
        const player2AchievementImageUrl = achievements.find(
          (achievement) => achievement.id === player2AchievementId,
        )?.imageUrl;
        updatedUserAchievements.updateAchievements.push(
          new UpdateUserAchievementDto(
            player2Id,
            player2Achievement,
            player2AchievementImageUrl,
          ),
        );
      }
    }

    function getAchievementByLPCut(lp: number): number | undefined {
      const lpThresholds = [
        { cut: Number(process.env.DOCTOR_CUT), achievementIndex: 6 },
        { cut: Number(process.env.MASTER_CUT), achievementIndex: 5 },
        { cut: Number(process.env.BACHELOR_CUT), achievementIndex: 4 },
        { cut: Number(process.env.STUDENT_CUT), achievementIndex: 3 },
      ];

      for (const threshold of lpThresholds) {
        if (lp >= threshold.cut) {
          return achievements[threshold.achievementIndex]?.id;
        }
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
  await this.userRepository.update(player1.id, player1Exp);
  const updatedPlayer1: User = await this.userRepository.findById(player1Id);

  // player2의 레벨 업 체크 및 경험치 추가
  const player2Exp = this.calculateExperiencePoints(player2Result);
  await this.userRepository.update(player2.id, player2Exp);
  const updatedPlayer2: User = await this.userRepository.findById(player2Id);

  // 업데이트된 유저 타이틀 정보를 반환합니다.
  const updateUserTitles: UpdateUserTitlesDto = new UpdateUserTitlesDto();
  updateUserTitles.updateUserTitles = [];

  await this.addNewTitleIfNotExists(updatedPlayer1, titles, updateUserTitles);
  await this.addNewTitleIfNotExists(updatedPlayer2, titles, updateUserTitles);

  return updateUserTitles;
  }

  private async addNewTitleIfNotExists(
    player: User,
    titles: Title[],
    updateUserTitles: UpdateUserTitlesDto
  ): Promise<void> {
    const playerLevel = calculateLevel(player.exp);
  
    const titleMapping = [
      { level: 100, titleIndex: 2 },
      { level: 42, titleIndex: 1 },
      { level: 10, titleIndex: 0 },
    ];
  
    for (const mapping of titleMapping) {
      if (playerLevel >= mapping.level) {
        const titleExist: UserTitle =
          await this.userTitleRepository.findByUserIdAndTitleId(
            player.id,
            titles[mapping.titleIndex].id
          );
        if (!titleExist) {
          await this.userTitleRepository.save(
            player.id,
            titles[mapping.titleIndex].id
          );
          updateUserTitles.updateUserTitles.push(
            new UpdateUserTitleDto(player.id, titles[mapping.titleIndex].name)
          );
        }
      }
    }
  }
  
  private calculateExperiencePoints(playerResult: GameResultType): number {
    const expMap = {
      [GAMERESULT_WIN]: Number(process.env.GAME_WIN_EXP),
      [GAMERESULT_LOSE]: Number(process.env.GAME_LOSE_EXP),
      [GAMERESULT_TIE]: Number(process.env.GAME_TIE_EXP),
    };

    return expMap[playerResult];
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
    const tierMapping = [
      { cut: Number(process.env.DOCTOR_CUT), tier: TIER_DOCTOR },
      { cut: Number(process.env.MASTER_CUT), tier: TIER_MASTER },
      { cut: Number(process.env.BACHELOR_CUT), tier: TIER_BACHELOR },
      { cut: Number(process.env.STUDENT_CUT), tier: TIER_STUDENT },
    ];

    for (const tier of tierMapping) {
      if (playerLP >= tier.cut) {
        return tier.tier;
      }
    }
  }
}
``
export function calculateLevel(exp: number): number {
  const level = Math.floor(exp / Number(process.env.LEVEL_UP_EXP));
  return level + 1;
}
