import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievemet } from 'src/achievemet/achievement.entity';
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
		@InjectRepository(Achievemet)
		private achievementRepository: Repository<Achievemet>,
		@InjectRepository(UserAchievement)
		private userAchievementRepository: Repository<UserEmoji>,
		@InjectRepository(Rank)
		private rankRepository: Repository<Rank>,
		@InjectRepository(Season)
		private seasonRepository: Repository<Season>,
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
	){}
	users: User[] = [];
	emojis : Emoji[] = [];
	titles : Title[] = [];
	achievements : Achievemet[] = [];
	seasons : Season[] = [];
	ranks : Rank[] = [];

	async createBasicUser() : Promise<User> {
		const index : number = this.users.length;
		const user = await this.userRepository.save({
			nickname: index.toString(),
			email: index.toString() + '@mail.com',
			statusMessage: index.toString(),
			imageUrl: 'basicImage'+ index.toString(),
		});
		return user;
	}

	async createBasicCollectable() : Promise<void> {
		for (let i = 0; i < 10; i++) {
			this.emojis.push(await this.emojiRepository.save({
				name: 'emoji' + i.toString(),
				imageUrl: 'imageUrl' + i.toString(),
			}));
		}
		for (let i = 0; i < 10; i++) {
			this.titles.push(await this.titleRepository.save({
				name: 'emoji' + i.toString(),
				content: 'content' + i.toString(),
			}));
		}
		for (let i = 0; i < 10; i++) {
			this.achievements.push(await this.achievementRepository.save({
				name: 'emoji' + i.toString(),
				content: 'content' + i.toString(),
				imageUrl: 'imageUrl' + i.toString(),
			}));
		}
	}

	async createUserWithUnSelectedEmojis() : Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithUEmoji',
			email: 'emoji@mail.com',
			imageUrl: 'basicImage',
		});
		this.users.push(user);
		for (const c of this.emojis) {
			if (4 < c.id)
				continue;
			await this.userEmojiRepository.save({
				user: user,
				emoji: c,
				selectedOrder: null,
			})
		}
		return user;
	}

	async createUserWithUnSelectedAchievements() : Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithAchievements',
			email: 'achv@mail.com',
			imageUrl: 'basicImage',
		});

		for (const c of this.achievements) {
			if (3 < c.id)
				continue;
			await this.userAchievementRepository.save({
				user: user,
				achievement: c,
				selectedOrder: null,
			})
		}
		return user;
	}

	async createUserWithUnSelectedTitles() : Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithAchievements',
			email: 'achv@mail.com',
			imageUrl: 'basicImage',
		});
		for (const c of this.titles) {
			if (this.titles.length / 2 < c.id)
				continue;
			await this.userTitleRepository.save({
				user: user,
				title: c,
				selectedOrder: false,
			})
		}
		return user;
	}

	async createBasicSeasons(n: number) : Promise<Season[]> {
		for (let i = 0; i < n; i++) {
			this.seasons.push(await this.seasonRepository.save({
				name: i.toString(),
				startTime: '2021-01-'+ i.toString(),
				endTime: '2022-01-'+ i.toString(),
				imageUrl: 'SeasonImage'+ i.toString(),
			}));
		}
		return this.seasons;
	}

	async createBasicRank(): Promise<Rank[]>{		
		for(let i = 0 ; i < this.users.length; i++){
			for (const c of this.seasons) {
				this.ranks.push(await this.rankRepository.save({
					season: c,
					user: this.users[i],
					ladderRank: i + 1,
					ladderPoint: 100 - i,
					highestRanking: i + 1,
					highestPoint: 1000 - i,
				}))
			}
		}
		return this.ranks;
	}

	async createUserWithCollectables() : Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithCollectable',
			email: 'user@mail.com',
			imageUrl: 'basicImage',
		});
		this.users.push(user);
		for (let i : number = 0; i < this.emojis.length; i++) {
			if (5 < i)
				continue;
			await this.userEmojiRepository.save({
				user: user,
				emoji: this.emojis[i],
				selectedOrder: i < 4 ? i : null,
			})
		}
		for (let i = 0; i < this.titles.length; i++) {
			if (i % 2 === 0)
				continue;
			await this.userTitleRepository.save({
				user: user,
				title: this.titles[i],
				isSelected: i == 0 ? true : false,
			});
		}
		for (let i = 0; i < this.achievements.length; i++) {
			if (5 < i)
				continue;
			await this.userAchievementRepository.save({
				user: user,
				achievement: this.achievements[i],
				selectedOrder: i < 3 ? i : null,
			});
		}
		return user;
	}

	async createReverseSelectedEmojiUser(): Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithMixedEmoji',
			email: 'emoji@mail.com',
			imageUrl: 'basicImage',
		});
		this.users.push(user);
		for (const c of this.emojis) {
			if (4 < c.id)
				continue;
			await this.userEmojiRepository.save({
				user: user,
				emoji: c,
				selectedOrder: 4 - c.id,
			})
		}
		return user;
	}

	async createMixedSelectedEmojiUser(): Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithMixedWithNullEmoji',
			email: 'emoji@mail.com',
			imageUrl: 'basicImage',
		});
		this.users.push(user);
		await this.userEmojiRepository.save({
			user: user,
			emoji: this.emojis[2],
			selectedOrder: 1,
		})
		await this.userEmojiRepository.save({
			user: user,
			emoji: this.emojis[0],
			selectedOrder: 3,
		})
		return user;
	}

	async createReverseSelectedAchievementUser(): Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithReversedAchievement',
			email: 'achievement@mail.com',
			imageUrl: 'basicImage',
		});
		this.users.push(user);
		for (const c of this.achievements) {
			if (3 < c.id)
				continue;
			await this.userAchievementRepository.save({
				user: user,
				achievement: c,
				selectedOrder: 3 - c.id,
			})
		}
		return user;
	}

	async createMixedSelectedAchievementUser(): Promise<User> {
		const user : User = await this.userRepository.save({
			nickname: 'userWithMixedWithNullAchievement',
			email: 'achievement@mail.com',
			imageUrl: 'basicImage',
		});
		this.users.push(user);
		await this.userAchievementRepository.save({
			user: user,
			achievement: this.achievements[2],
			selectedOrder: 1,
		})
		return user;
	}

}
