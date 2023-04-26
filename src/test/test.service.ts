import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievemet } from 'src/achievemet/achievement.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { Game } from 'src/game/game.entity';
import { Rank } from 'src/rank/rank.entity';
import { Season } from 'src/season/season.entity';
import { Title } from 'src/title/title.entity';
import { UserAchievement } from 'src/user-achievemet/user-achievement.entity';
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
	
	async createBasicUsers(n: number) : Promise<User[]> {
		let users : User[] = [];
		for (let i = 0; i < n; i++) {
			users.push(await this.userRepository.save({
				nickname: i.toString(),
				email: i.toString() + '@mail.com',
				statusMessage: i.toString(),
				imageUrl: 'basicImage'+ i.toString(),
			}));
		}
		console.log(users);
		return users;
	}

	async createUserWithUnSelectedEmojis(emojiNum: number) : Promise<User> {
		let emojis : Emoji[] = [];
		const user : User = await this.userRepository.save({
			nickname: 'userWithUEmoji',
			email: 'emoji@mail.com',
			imageUrl: 'basicImage',
	});
		for (let i = 0; i < emojiNum; i++) {
			emojis.push(await this.emojiRepository.save({
				name: 'image' + i.toString(),
				imageUrl: 'imageUrl' + i.toString(),
			}))
		}
		for (const c of emojis) {
			if (c.id % 2 === 0)
				continue;
			await this.userEmojiRepository.save({
				user: user,
				emoji: c,
				isSelected: false,
			})
		}
		return user;
	}

	async createUserWithUnSelectedAchievements(achvNum: number) : Promise<User> {
		let achvs : Achievemet[] = [];
		const user : User = await this.userRepository.save({
			nickname: 'userWithAchievements',
			email: 'achv@mail.com',
			imageUrl: 'basicImage',
	});
		for (let i = 0; i < achvNum; i++) {
			achvs.push(await this.achievementRepository.save({
				name: 'image' + i.toString(),
				imageUrl: 'imageUrl' + i.toString(),
			}))
		}
		for (const c of achvs) {
			if (c.id % 2 === 0)
				continue;
			await this.userAchievementRepository.save({
				user: user,
				achievement: c,
				isSelected: false,
			})
		}
		return user;
	}

	async createUserWithUnSelectedTitles(achvNum: number) : Promise<User> {
		let titles : Title[] = [];
		const user : User = await this.userRepository.save({
			nickname: 'userWithAchievements',
			email: 'achv@mail.com',
			imageUrl: 'basicImage',
		});
		for (let i = 0; i < achvNum; i++) {
			titles.push(await this.titleRepository.save({
				name: 'title' + i.toString(),
				contents: 'content' + i.toString(),
			}))
		}
		for (const c of titles) {
			if (c.id % 2 === 0)
				continue;
			await this.userTitleRepository.save({
				user: user,
				title: c,
				isSelected: false,
			})
		}
		return user;
	}

	async createBasicSeasons(n: number) : Promise<Season[]> {
		let seasons : Season[] = [];
		for (let i = 0; i < n; i++) {
			seasons.push(await this.seasonRepository.save({
				name: i.toString(),
				startTime: '2021-01-'+ i.toString(),
				endTime: '2022-01-'+ i.toString(),
				imageUrl: 'SeasonImage'+ i.toString(),
			}));
		}
		return seasons;
	}

	async createBasicRank(n: number): Promise<Rank[]>{
		let ranks : Rank[] = [];
		let seasons : Season[] = [];
		let users : User[] = [];
		
		for (let i = 0; i < n; i++) {
			users.push(await this.userRepository.save({
				nickname: i.toString(),
				email: i.toString() + '@mail.com',
				statusMessage: i.toString(),
				imageUrl: 'basicImage'+ i.toString(),
			}));
		}
		for (let i = 0; i < n; i++) {
			seasons.push(await this.seasonRepository.save({
				name: i.toString(),
				startTime: '2021-01-'+ i.toString(),
				endTime: '2022-01-'+ i.toString(),
				imageUrl: 'SeasonImage'+ i.toString(),
			}));
		}
		for(let i = 0 ; i < n; i++){
			for (const c of seasons) {
				ranks.push(await this.rankRepository.save({
					season: c,
					user: users[i],
					ladderRank: i + 1,
					ladderPoint: 100 - i,
					highestRanking: i + 1,
					highestPoint: 1000 - i,
				}))
			}
		}
		return ranks;
	}
}
