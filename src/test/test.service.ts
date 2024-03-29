import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievement } from 'src/domain/achievement/achievement.entity';
import { Emoji } from 'src/domain/emoji/emoji.entity';
import { Game } from 'src/domain/game/game.entity';
import { GAMETYPE_NORMAL, GAMETYPE_RANK } from 'src/global/type/type.game';
import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
} from 'src/global/type/type.game.result';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { Rank } from 'src/domain/rank/rank.entity';
import { Season } from 'src/domain/season/season.entity';
import { Title } from 'src/domain/title/title.entity';
import { UserAchievement } from 'src/domain/user-achievement/user-achievement.entity';
import { UserEmoji } from 'src/domain/user-emoji/user-emoji.entity';
import { UserGame } from 'src/domain/user-game/user-game.entity';
import { UserTitle } from 'src/domain/user-title/user-title.entity';
import { User } from 'src/domain/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { GAMEMODE_SFINAE } from 'src/global/type/type.game.mode';
import { TouchLog } from 'src/domain/touch-log/touch.log.entity';
import {
  GAMEEVENT_SCORE,
  GAMEEVENT_TOUCH,
} from 'src/global/type/type.game.event';

@Injectable()
export class TestService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Title)
    private titleRepository: Repository<Title>,
    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,
    @InjectRepository(Emoji)
    private emojiRepository: Repository<Emoji>,
    @InjectRepository(UserEmoji)
    private userEmojiRepository: Repository<UserEmoji>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Rank)
    private rankRepository: Repository<Rank>,
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(ProfileImage)
    private profileImageRepository: Repository<ProfileImage>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(UserGame)
    private userGameRepository: Repository<UserGame>,
    @InjectRepository(TouchLog)
    private touchLogRepository: Repository<TouchLog>,
  ) {}
  users: User[] = [];
  profileImages: ProfileImage[] = [];
  emojis: Emoji[] = [];
  titles: Title[] = [];
  achievements: Achievement[] = [];
  seasons: Season[] = [];
  ranks: Rank[] = [];
  currentSeasonRanks: Rank[] = [];
  currentSeason: Season;
  games: Game[] = [];
  userGames: UserGame[] = [];
  touchLogs: TouchLog[] = [];

  clear(): void {
    this.users.splice(0);
    this.profileImages.splice(0);
    this.emojis.splice(0);
    this.titles.splice(0);
    this.achievements.splice(0);
    this.seasons.splice(0);
    this.ranks.splice(0);
    this.currentSeasonRanks.splice(0);
    this.currentSeason = null;
    this.games.splice(0);
    this.userGames.splice(0);
    this.touchLogs.splice(0);
  }

  async createProfileImages(): Promise<void> {
    this.profileImages.push(
      await this.profileImageRepository.save({
        url: 'basic image1',
      }),
    );
    this.profileImages.push(
      await this.profileImageRepository.save({
        url: 'basic image2',
      }),
    );
  }

  /** 유저 생성 태초 유저임*/
  async createBasicUser(): Promise<User> {
    const index: number = this.users.length;
    const user = await this.userRepository.save({
      id: index + 2,
      nickname: 'user' + index.toString(),
      image: this.profileImages[0],
      exp: 0,
    });
    this.users.push(user);
    return user;
  }

  async createLevel9Users(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      const user = await this.userRepository.save({
        id: i + 1,
        nickname: 'user' + i.toString(),
        email: i.toString() + '@mail.com',
        statusMessage: i.toString(),
        image: this.profileImages[0],
      });
      this.users.push(user);
    }
  }

  async createBasicUsers(): Promise<void> {
    // 해결
    for (let i = 0; i < 10; i++) {
      const user = await this.userRepository.save({
        id: i + 1,
        nickname: 'user' + i.toString(),
        email: i.toString() + '@mail.com',
        statusMessage: i.toString(),
        image: this.profileImages[i % 2],
      });
      this.users.push(user);
    }
  }

  /** 이미지 없는 유저 생성*/
  async createBasicUserWithoutImg(): Promise<User> {
    const index: number = this.users.length;
    const user = await this.userRepository.save({
      id: index + 1,
      nickname: 'user' + index.toString(),
      email: index.toString() + '@mail.com',
      statusMessage: index.toString(),
      image: this.profileImages[0],
    });
    this.users.push(user);
    return user;
  }

  /**이모지 타이틀 어치브먼트 생성*/
  async createBasicCollectable(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      this.emojis.push(
        await this.emojiRepository.save({
          name: 'emoji' + i.toString(),
          imageUrl: 'imageUrl' + i.toString(),
        }),
      );
    }
    for (let i = 0; i < 10; i++) {
      this.titles.push(
        await this.titleRepository.save({
          name: 'title' + i.toString(),
          content: 'content' + i.toString(),
        }),
      );
    }
    for (let i = 0; i < 10; i++) {
      this.achievements.push(
        await this.achievementRepository.save({
          name: 'achievement' + i.toString(),
          content: 'content' + i.toString(),
          imageUrl: 'imageUrl' + i.toString(),
        }),
      );
    }
  }

  /**이모지를 선택하지 않은 유저 생성[null null null null]*/
  async createUserWithUnSelectedEmojis(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 3,
      nickname: 'userWithUEmoji',
      email: 'emoji@mail.com',
      image: this.profileImages[0],
    });
    this.users.push(user);
    for (const c of this.emojis) {
      if (this.emojis[4].id < c.id) break;
      await this.userEmojiRepository.save({
        user: user,
        emoji: c,
        selectedOrder: null,
      });
    }
    return user;
  }

  /**이모지가 아예 없는 유저 생성*/
  async createUserWithUnAchievedEmoji(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 1,
      nickname: 'userWithoutAchievements',
      email: '@mail.com',
      image: this.profileImages[0],
    });
    return user;
  }

  /** 어치브먼트를 선택하지 않은 유저 생성[null null null]*/
  async createUserWithUnSelectedAchievements(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 2,
      nickname: 'userWithAchievements',
      email: 'achv@mail.com',
      image: this.profileImages[0],
    });
    for (const c of this.achievements) {
      if (this.achievements[3].id < c.id) break;
      await this.userAchievementRepository.save({
        user: user,
        achievement: c,
        selectedOrder: null,
      });
    }
    return user;
  }

  /** 어치브먼트가 아예 없는 유저 생성*/
  async createUserWithUnAchievedAchievements(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 3,
      nickname: 'userWithoutAchievements',
      email: '@mail.com',
      image: this.profileImages[0],
    });
    return user;
  }

  /** 타이틀을 선택한 유저 생성*/
  async createUserWithSelectedTitles(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 4,
      nickname: 'userWithAchievements',
      email: 'achv@mail.com',
      image: this.profileImages[0],
    });
    for (let i = 0; i < this.titles.length; i++) {
      if (4 < i) break;
      await this.userTitleRepository.save({
        user: user,
        title: this.titles[i],
        isSelected: i == 0 ? true : false,
      });
    }
    this.users.push(user);
    return user;
  }

  /**타이틀을 선택하지 않은 유저 생성*/
  async createUserWithUnSelectedTitles(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 5,
      nickname: 'userWithAchievements',
      email: 'achv@mail.com',
      image: this.profileImages[0],
    });
    for (let i = 0; i < this.titles.length; i++) {
      if (4 < i) break;
      await this.userTitleRepository.save({
        user: user,
        title: this.titles[i],
        isSelected: false,
      });
    }
    this.users.push(user);
    return user;
  }

  /**기본 시즌 생성*/
  async createBasicSeasons(n: number): Promise<Season[]> {
    for (let i = 1; i <= n; i++) {
      this.seasons.push(
        await this.seasonRepository.save({
          name: i.toString(),
          startTime: new Date('2021-01-0' + i.toString()),
          endTime: new Date('2022-01-0' + i.toString()),
          imageUrl: 'SeasonImage' + i.toString(),
        }),
      );
    }
    this.currentSeason = this.seasons[n - 1];
    return this.seasons;
  }

  /**생성된 유저 혹은 유저들 에게 랭크 값 부여*/
  async createBasicRank(): Promise<Rank[]> {
    for (let i = 0; i < this.users.length; i++) {
      for (const c of this.seasons) {
        this.ranks.push(
          await this.rankRepository.save({
            season: c,
            user: this.users[i],
            ladderPoint: Number(process.env.DOCTOR_CUT) * 10 - i,
            highestPoint: Number(process.env.DOCTOR_CUT) * 10 - i,
          }),
        );
      }
    }
    return this.ranks;
  }

  async createSameRank(): Promise<Rank[]> {
    this.currentSeason = await this.seasonRepository.save({
      name: 'sameRanks',
      startTime: '2021-01-01',
      endTime: '2022-01-02',
      imageUrl: 'SeasonImage',
    });

    for (let i = 0; i < this.users.length; i++) {
      this.ranks.push(
        await this.rankRepository.save({
          season: this.currentSeason,
          user: this.users[i],
          ladderPoint: Number(process.env.DOCTOR_CUT) * 10,
          highestPoint: Number(process.env.DOCTOR_CUT) * 10,
        }),
      );
    }
    return this.ranks;
  }

  async createCurrentSeasonRank(): Promise<Rank[]> {
    this.currentSeason = await this.seasonRepository.save({
      name: 'currentSeason',
      startTime: '2021-01-01',
      endTime: '2022-01-01',
      imageUrl: 'SeasonImage',
    });
    for (let i = 0; i < this.users.length; i++) {
      this.currentSeasonRanks.push(
        await this.rankRepository.save({
          season: this.currentSeason,
          user: this.users[i],
          ladderPoint: Number(process.env.DOCTOR_CUT) * 10 - i,
          highestPoint: Number(process.env.DOCTOR_CUT) * 10 - i,
        }),
      );
    }
    return this.currentSeasonRanks;
  }

  /**이모지 타이틀 어치브먼트를 모두 가진 유저 생성*/
  async createUserWithCollectables(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 6,
      nickname: 'userWithCollectable',
      email: 'user@mail.com',
      image: this.profileImages[0],
    });
    this.users.push(user);
    for (let i = 0; i < this.emojis.length; i++) {
      if (5 < i) break;
      await this.userEmojiRepository.save({
        user: user,
        emoji: this.emojis[i],
        selectedOrder: i < 4 ? i : null,
      });
    }
    for (let i = 0; i < this.titles.length; i++) {
      if (4 < i) break;
      await this.userTitleRepository.save({
        user: user,
        title: this.titles[i],
        isSelected: i == 0 ? true : false,
      });
    }
    for (let i = 0; i < this.achievements.length; i++) {
      if (5 < i) break;
      await this.userAchievementRepository.save({
        user: user,
        achievement: this.achievements[i],
        selectedOrder: i < 3 ? i : null,
      });
    }
    return user;
  }

  /**이모지를 반대로 선택한 유저 생성 [3 2 1 0]*/
  async createReverseSelectedEmojiUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 7,
      nickname: 'userWithMixedEmoji',
      email: 'emoji@mail.com',
      image: this.profileImages[0],
    });
    this.users.push(user);
    for (let i = 0; i < this.emojis.length; i++) {
      if (3 < i) break;
      await this.userEmojiRepository.save({
        user: user,
        emoji: this.emojis[i],
        selectedOrder: 3 - (i % 4),
      });
    }
    return user;
  }

  /**이모지를 임의로 선택한 유저생성[0 null 2 null]*/
  async createMixedSelectedEmojiUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 8,
      nickname: 'userWithMixedWithNullEmoji',
      email: 'emoji@mail.com',
      image: this.profileImages[0],
    });
    this.users.push(user);
    await this.userEmojiRepository.save({
      user: user,
      emoji: this.emojis[2],
      selectedOrder: 0,
    });
    await this.userEmojiRepository.save({
      user: user,
      emoji: this.emojis[3],
      selectedOrder: 2,
    });
    return user;
  }

  /**어치브먼트를 반대로 선택한 유저 생성 [3 2 1 0]*/
  async createReverseSelectedAchievementUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 9,
      nickname: 'userWithReversedAchievement',
      email: 'achievement@mail.com',
      image: this.profileImages[0],
    });
    this.users.push(user);
    for (let i = 0; i < this.achievements.length; i++) {
      if (2 < i) break;
      await this.userAchievementRepository.save({
        user: user,
        achievement: this.achievements[i],
        selectedOrder: 2 - (i % 3),
      });
    }
    return user;
  }

  /** 어치브먼트를 임의로 선택한 유저 생성 [0 null 2 null]*/
  async createMixedSelectedAchievementUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      id: 10,
      nickname: 'userWithMixedWithNullAchievement',
      email: 'achievement@mail.com',
      image: this.profileImages[0],
    });
    this.users.push(user);
    await this.userAchievementRepository.save({
      user: user,
      achievement: this.achievements[2],
      selectedOrder: 0,
    });
    await this.userAchievementRepository.save({
      user: user,
      achievement: this.achievements[3],
      selectedOrder: 2,
    });
    return user;
  }

  /**게임 만들기 */
  async createBasicGames(): Promise<void> {
    await this.createBasicUser();
    await this.createBasicUser();
    for (let i = 0; i < 3; i++) {
      this.games.push(
        await this.gameRepository.save({
          season: this.currentSeason,
          startTime: '2021-01-01',
          playTime: 10000,
          type: GAMETYPE_RANK,
          mode: GAMEMODE_SFINAE,
        }),
      );
    }
    for (let j = 0; j < 6; j++) {
      this.userGames.push(
        await this.userGameRepository.save({
          user: j % 2 === 0 ? this.users[0] : this.users[1],
          game: this.games[Math.floor(j / 2)],
          result: j % 2 === 0 ? GAMERESULT_WIN : GAMERESULT_LOSE,
          score: j % 2 === 0 ? 10 : 0,
          lpChange: 0,
          lpResult: 100,
        }),
      );
    }
  }

  //** 2개의 시즌일때 과거의 시즌에 게임데이터 넣기 */
  async createPastSeasonGames(): Promise<void> {
    await this.createBasicUser();
    await this.createBasicUser();
    for (let i = 0; i < 3; i++) {
      this.games.push(
        await this.gameRepository.save({
          season: this.seasons[0],
          startTime: '2021-01-01',
          playTime: 10,
          type: GAMETYPE_RANK,
          mode: GAMEMODE_SFINAE,
        }),
      );
    }
    for (let j = 0; j < 6; j++) {
      this.userGames.push(
        await this.userGameRepository.save({
          user: j % 2 === 0 ? this.users[0] : this.users[1],
          game: this.games[j / 2],
          result: j % 2 === 0 ? GAMERESULT_WIN : GAMERESULT_LOSE,
          score: j % 2 === 0 ? 10 : 0,
          lpChange: 0,
          lpResult: 100,
        }),
      );
    }
  }

  /** 유저 2명이 진행한 게임 n개 만들기 (노말, 랭크 섞어서) */
  async createMixedTypeGames(n: number): Promise<void> {
    const winner: User = await this.createBasicUser();
    const loser: User = await this.createBasicUser();
    const users: User[] = [winner, loser];
    for (let i = 0; i < n; i++) {
      this.games.push(
        await this.gameRepository.save({
          season: this.currentSeason,
          startTime: '2021-01-01',
          playTime: 10,
          type: i % 2 === 0 ? GAMETYPE_RANK : GAMETYPE_NORMAL,
          mode: GAMEMODE_SFINAE,
        }),
      );
    }
    for (let i = 0; i < n; i++) {
      await this.userGameRepository.save({
        user: users[0],
        game: this.games[i],
        result: GAMERESULT_WIN,
        score: 10,
        lpChange: this.games[i].type === GAMETYPE_RANK ? 10 : 0,
        lpResult: 110,
      });
      await this.userGameRepository.save({
        user: users[1],
        game: this.games[i],
        result: GAMERESULT_LOSE,
        score: 0,
        lpChange: this.games[i].type === GAMETYPE_RANK ? -10 : 0,
        lpResult: 90,
      });
    }
  }
  //** 유저 한명의 인자로 받은 승 ,무, 패 데이터 만들기 */
  async createCustomResultUser(
    win: number,
    tie: number,
    lose: number,
  ): Promise<void> {
    this.currentSeason = await this.seasonRepository.save({
      name: 'currentSeason',
      startTime: '2021-01-01',
      endTime: '2022-01-01',
      imageUrl: 'SeasonImage',
    });
    const totalGame = win + tie + lose;
    const user1: User = await this.createBasicUser();
    const user2: User = await this.createBasicUser();
    for (let i = 0; i < totalGame; i++) {
      this.games.push(
        await this.gameRepository.save({
          season: this.currentSeason,
          startTime: '2021-01-01',
          playTime: 10,
          type: GAMETYPE_RANK,
          mode: GAMEMODE_SFINAE,
        }),
      );
    }
    let i = 0;
    for (; i < win; i++) {
      await this.userGameRepository.save({
        user: user1,
        game: this.games[totalGame - 1 - i],
        result: GAMERESULT_WIN,
        score: 10,
        lpChange: 10,
        lpResult: 110,
      });
      await this.userGameRepository.save({
        user: user2,
        game: this.games[totalGame - 1 - i],
        result: GAMERESULT_LOSE,
        score: 0,
        lpChange: -10,
        lpResult: 90,
      });
    }
    for (; i < win + tie; i++) {
      await this.userGameRepository.save({
        user: user1,
        game: this.games[totalGame - 1 - i],
        result: GAMERESULT_TIE,
        score: 5,
        lpChange: 0,
        lpResult: 100,
      });
      await this.userGameRepository.save({
        user: user2,
        game: this.games[totalGame - 1 - i],
        result: GAMERESULT_TIE,
        score: 5,
        lpChange: 0,
        lpResult: 100,
      });
    }
    for (; i < totalGame; i++) {
      await this.userGameRepository.save({
        user: user1,
        game: this.games[totalGame - 1 - i],
        result: GAMERESULT_LOSE,
        score: 0,
        lpChange: -10,
        lpResult: 90,
      });
      await this.userGameRepository.save({
        user: user2,
        game: this.games[totalGame - 1 - i],
        result: GAMERESULT_WIN,
        score: 10,
        lpChange: 10,
        lpResult: 110,
      });
    }
  }

  //** 10개의 시즌중 유저 한명의 인자로 받은 승 ,무, 패 데이터 만들기 */
  async createCustomResultUserBySeasons(
    win: number,
    tie: number,
    lose: number,
  ): Promise<void> {
    await this.createBasicSeasons(10);
    const totalGame = win + tie + lose;
    const user: User = await this.createBasicUser();
    for (let i = 0; i < totalGame; i++) {
      this.games.push(
        await this.gameRepository.save({
          season: this.currentSeason,
          startTime: new Date(2020, 1, 1),
          playTime: 10,
          type: GAMETYPE_RANK,
          mode: GAMEMODE_SFINAE,
        }),
      );
    }
    for (let i = 0; i < win; i++) {
      await this.userGameRepository.save({
        user: user,
        game: this.games[i],
        result: GAMERESULT_WIN,
        score: 10,
        lpChange: 10,
        lpResult: 110,
      });
    }
    for (let i = 0; i < lose; i++) {
      await this.userGameRepository.save({
        user: user,
        game: this.games[i + win],
        result: GAMERESULT_LOSE,
        score: 0,
        lpChange: -10,
        lpResult: 90,
      });
    }
    for (let i = 0; i < tie; i++) {
      await this.userGameRepository.save({
        user: user,
        game: this.games[i + win + lose],
        result: GAMERESULT_TIE,
        score: 5,
        lpChange: 0,
        lpResult: 100,
      });
    }
  }

  async giveTokenToUser(user: User) {
    const token = this.jwtService.sign({
      id: user.id,
      nickname: user.nickname,
    });
    return token;
  }

  async createGameWithTouchLog(n: number): Promise<UserGame> {
    const winner: User = await this.createBasicUser();
    const loser: User = await this.createBasicUser();
    const users: User[] = [winner, loser];
    const userGames = [];
    for (let i = 0; i < n; i++) {
      this.games.push(
        await this.gameRepository.save({
          season: this.currentSeason,
          startTime: '2021-01-01',
          playTime: 10000,
          type: i % 2 === 0 ? GAMETYPE_RANK : GAMETYPE_NORMAL,
          mode: GAMEMODE_SFINAE,
        }),
      );
    }
    userGames.push(
      await this.userGameRepository.save({
        user: users[0],
        game: this.games[0],
        result: GAMERESULT_WIN,
        score: 10,
        lpChange: this.games[0].type === GAMETYPE_RANK ? 10 : 0,
        lpResult: 110,
      }),
    );
    userGames.push(
      await this.userGameRepository.save({
        user: users[1],
        game: this.games[0],
        result: GAMERESULT_LOSE,
        score: 0,
        lpChange: this.games[0].type === GAMETYPE_RANK ? -10 : 0,
        lpResult: 90,
      }),
    );

    for (let i = 0; i < n; i++) {
      await this.touchLogRepository.save({
        userGame: userGames[i % 2],
        event: i % 10 === 0 ? GAMEEVENT_SCORE : GAMEEVENT_TOUCH,
        round: i + 1,
        ballSpeed: 10,
        ballDirectionX: 10,
        ballDirectionY: 10,
        ballPositionX: 10,
        ballPositionY: 10,
        ballSpinSpeed: 10,
      });
    }
    return userGames[0];
  }
}
