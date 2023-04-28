import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievement } from 'src/achievement/achievement.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { Game } from 'src/game/game.entity';
import { Rank } from 'src/rank/rank.entity';
import { Season } from 'src/season/season.entity';
import { Title } from 'src/title/title.entity';
import { UserAchievement } from 'src/user-achievement/user-achievement.entity';
import { UserEmoji } from 'src/user-emoji/user-emoji.entity';
import { UserGame } from 'src/user-game/user-game.entity';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TestService {
  constructor(
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
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}
  users: User[] = [];
  emojis: Emoji[] = [];
  titles: Title[] = [];
  achievements: Achievement[] = [];
  seasons: Season[] = [];
  ranks: Rank[] = [];

  async createBasicUser(): Promise<User> {
    const index: number = this.users.length;
    const user = await this.userRepository.save({
      nickname: 'user' + index.toString(),
      email: index.toString() + '@mail.com',
      statusMessage: index.toString(),
      imageUrl: 'basicImage' + index.toString(),
    });
    this.users.push(user);
    return user;
  }

  async createBasicUserWithoutImg(): Promise<User> {
    const index: number = this.users.length;
    const user = await this.userRepository.save({
      nickname: 'user' + index.toString(),
      email: index.toString() + '@mail.com',
      statusMessage: index.toString(),
      imageUrl: null,
    });
    this.users.push(user);
    return user;
  }

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
          name: 'emoji' + i.toString(),
          content: 'content' + i.toString(),
        }),
      );
    }
    for (let i = 0; i < 10; i++) {
      this.achievements.push(
        await this.achievementRepository.save({
          name: 'emoji' + i.toString(),
          content: 'content' + i.toString(),
          imageUrl: 'imageUrl' + i.toString(),
        }),
      );
    }
  }

  async createUserWithUnSelectedEmojis(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithUEmoji',
      email: 'emoji@mail.com',
      imageUrl: 'basicImage',
    });
    this.users.push(user);
    for (const c of this.emojis) {
      if (this.emojis[4].id < c.id) continue;
      await this.userEmojiRepository.save({
        user: user,
        emoji: c,
        selectedOrder: null,
      });
    }
    return user;
  }
  async createUserWithUnAchievedEmoji(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithoutAchievements',
      email: '@mail.com',
      imageUrl: 'basicImage',
    });
    return user;
  }

  async createUserWithUnSelectedAchievements(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithAchievements',
      email: 'achv@mail.com',
      imageUrl: 'basicImage',
    });
    for (const c of this.achievements) {
      if (this.achievements[3].id < c.id) continue;
      await this.userAchievementRepository.save({
        user: user,
        achievement: c,
        selectedOrder: null,
      });
    }
    return user;
  }

  async createUserWithUnAchievedAchievements(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithoutAchievements',
      email: '@mail.com',
      imageUrl: 'basicImage',
    });
    return user;
  }

  async createUserWithUnSelectedTitles(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithAchievements',
      email: 'achv@mail.com',
      imageUrl: 'basicImage',
    });
    for (let i = 0; i < this.titles.length; i++) {
      if (4 < i) continue;
      await this.userTitleRepository.save({
        user: user,
        title: this.titles[i],
        isSelected: false,
      });
    }
    this.users.push(user);
    return user;
  }

  async createBasicSeasons(n: number): Promise<Season[]> {
    for (let i = 1; i <= n; i++) {
      this.seasons.push(
        await this.seasonRepository.save({
          name: i.toString(),
          startTime: '2021-01-0' + i.toString(),
          endTime: '2022-01-0' + i.toString(),
          imageUrl: 'SeasonImage' + i.toString(),
        }),
      );
    }
    return this.seasons;
  }

  async createBasicRank(): Promise<Rank[]> {
    for (let i = 0; i < this.users.length; i++) {
      for (const c of this.seasons) {
        this.ranks.push(
          await this.rankRepository.save({
            season: c,
            user: this.users[i],
            ladderRank: i + 1,
            ladderPoint: 100 - i,
            highestRanking: i + 1,
            highestPoint: 1000 - i,
          }),
        );
      }
    }
    return this.ranks;
  }

  async createUserWithCollectables(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithCollectable',
      email: 'user@mail.com',
      imageUrl: 'basicImage',
    });
    this.users.push(user);
    for (let i: number = 0; i < this.emojis.length; i++) {
      if (5 < i) continue;
      await this.userEmojiRepository.save({
        user: user,
        emoji: this.emojis[i],
        selectedOrder: i < 4 ? i : null,
      });
    }
    for (let i = 0; i < this.titles.length; i++) {
      if (4 < i) continue;
      await this.userTitleRepository.save({
        user: user,
        title: this.titles[i],
        isSelected: i == 0 ? true : false,
      });
    }
    for (let i = 0; i < this.achievements.length; i++) {
      if (5 < i) continue;
      await this.userAchievementRepository.save({
        user: user,
        achievement: this.achievements[i],
        selectedOrder: i < 3 ? i : null,
      });
    }
    return user;
  }

  async createReverseSelectedEmojiUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithMixedEmoji',
      email: 'emoji@mail.com',
      imageUrl: 'basicImage',
    });
    this.users.push(user);
    for (let i = 0; i < this.emojis.length; i++) {
      if (3 < i) continue;
      await this.userEmojiRepository.save({
        user: user,
        emoji: this.emojis[i],
        selectedOrder: 3 - (i % 4),
      });
    }
    return user;
  }

  async createMixedSelectedEmojiUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithMixedWithNullEmoji',
      email: 'emoji@mail.com',
      imageUrl: 'basicImage',
    });
    this.users.push(user);
    await this.userEmojiRepository.save({
      user: user,
      emoji: this.emojis[2],
      selectedOrder: 1,
    });
    await this.userEmojiRepository.save({
      user: user,
      emoji: this.emojis[0],
      selectedOrder: 3,
    });
    return user;
  }

  async createReverseSelectedAchievementUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithReversedAchievement',
      email: 'achievement@mail.com',
      imageUrl: 'basicImage',
    });
    this.users.push(user);
    for (let i = 0; i < this.achievements.length; i++) {
      if (2 < i) continue;
      await this.userAchievementRepository.save({
        user: user,
        achievement: this.achievements[i],
        selectedOrder: 2 - (i % 3),
      });
    }
    return user;
  }

  async createMixedSelectedAchievementUser(): Promise<User> {
    const user: User = await this.userRepository.save({
      nickname: 'userWithMixedWithNullAchievement',
      email: 'achievement@mail.com',
      imageUrl: 'basicImage',
    });
    this.users.push(user);
    await this.userAchievementRepository.save({
      user: user,
      achievement: this.achievements[2],
      selectedOrder: 1,
    });
    await this.userAchievementRepository.save({
      user: user,
      achievement: this.achievements[3],
      selectedOrder: 3,
    });
    return user;
  }
}
