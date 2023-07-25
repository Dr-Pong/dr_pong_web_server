import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { UserDetailDto } from './dto/user.detail.dto';
import { PatchUserImageDto } from './dto/patch.user.image.dto';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { UserRepository } from './user.repository';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import { ProfileImageRepository } from 'src/domain/profile-image/profile-image.repository';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import {
  ProfileImageDto,
  ProfileImagesDto,
} from 'src/domain/profile-image/dto/profile-image.dto';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { PostGatewayUserDto } from './dto/post.gateway.users.dto';
import { RankRepository } from '../rank/rank.repository';
import { SeasonRepository } from '../season/season.repository';
import { Season } from '../season/season.entity';
import { calculateLevel } from '../game/game.service';
import { UserEmojiRepository } from '../user-emoji/user-emoji.repository';
import { Emoji } from '../emoji/emoji.entity';
import { EmojiRepository } from '../emoji/emoji.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private rankRepository: RankRepository,
    private readonly seasonRepository: SeasonRepository,
    private profileImageRepository: ProfileImageRepository,
    private userEmojiRepository: UserEmojiRepository,
    private emojiRepository: EmojiRepository,
  ) {}
  users: Map<string, User> = new Map();

  //get detail service
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUsersDetail(getDto: GetUserDetailDto): Promise<UserDetailDto> {
    const user = await this.userRepository.findByNickname(getDto.nickname);
    if (!user) throw new NotFoundException('No such User');

    const image: ProfileImageDto = {
      id: user.image.id,
      url: user.image.url,
    };

    const responseDto: UserDetailDto = {
      nickname: user.nickname,
      image,
      level: calculateLevel(user.exp),
      statusMessage: user.statusMessage,
    };
    return responseDto;
  }

  //get user info
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserInfo(getDto: GetUserDetailDto): Promise<UserInfoDto> {
    const userFromMemory = this.users.get(getDto.nickname);
    if (userFromMemory) {
      const responseDto: UserInfoDto = {
        id: userFromMemory.id,
        nickname: userFromMemory.nickname,
      };
      return responseDto;
    }

    const userFromDatabase = await this.userRepository.findByNickname(
      getDto.nickname,
    );
    if (!userFromDatabase) throw new NotFoundException('No such User');

    this.users.set(userFromDatabase.nickname, userFromDatabase);
    const responseDto: UserInfoDto = {
      id: userFromDatabase.id,
      nickname: userFromDatabase.nickname,
    };
    return responseDto;
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async patchUserImage(patchDto: PatchUserImageDto): Promise<void> {
    const user = await this.userRepository.findById(patchDto.userId);
    if (!user) throw new NotFoundException('No such User');
    const image = await this.profileImageRepository.findById(patchDto.imageId);
    if (!image) throw new NotFoundException('No such Image');

    await this.userRepository.updateUserImage(user, image);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async patchUserStatusMessage(patchDto: PatchUserMessageDto): Promise<void> {
    const user = await this.userRepository.findById(patchDto.userId);
    if (!user) throw new NotFoundException('No such User');

    await this.userRepository.updateUserStatusMessage(user, patchDto);
  }

  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserImages(): Promise<ProfileImagesDto> {
    const profileImages: ProfileImage[] =
      await this.profileImageRepository.findAll();
    const imageDtos: ProfileImageDto[] = profileImages.map((profileImages) => {
      return { id: profileImages.id, url: profileImages.url };
    });
    const responseDto: ProfileImagesDto = {
      images: imageDtos,
    };
    return responseDto;
  }

  @Transactional({ isolationLevel: IsolationLevel.SERIALIZABLE })
  async postUser(postDto: PostGatewayUserDto): Promise<void> {
    const user: User = await this.userRepository.save(postDto);
    //user image 추가하는부분
    console.log('user', user);
    const emoji: Emoji[] = await this.emojiRepository.findAll()
    console.log('emoji', emoji);
    if(emoji){
      for(let i = 0; i <= 15; i++){
        await this.userEmojiRepository.save(user.id, emoji[i].id);
      }
    }
    const season: Season = await this.seasonRepository.findCurrentSeason();
    await this.rankRepository.save(user.id, season.id);
  }
}
