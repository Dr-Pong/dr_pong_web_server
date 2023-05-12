import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserDetailDto } from './dto/user.detail.dto';
import { PatchUserImageDto } from './dto/patch.user.image.dto';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { GetUserMeDto } from './dto/get.user.me.dto';
import { TokenInterface } from 'src/auth/jwt/jwt.token.interface';
import {
  ROLETYPE_GUEST,
  ROLETYPE_NONAME,
} from 'src/global/type/type.user.roletype';
import { UserMeDto } from './dto/user.me.dto';
import { UserRepository } from './user.repository';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import { ProfileImageRepository } from 'src/domain/profile-image/profile-image.repository';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { ProfileImageDto, ProfileImagesDto } from 'src/domain/profile-image/profile-image.dto';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private profileImageRepository: ProfileImageRepository,
  ) { }
  users: Map<string, User> = new Map();

  //get detail service
  async getUsersDetail(getDto: GetUserDetailDto): Promise<UserDetailDto> {
    const user = await this.userRepository.findByNickname(getDto.nickname);
    if (!user) throw new NotFoundException('No such User');

    const responseDto: UserDetailDto = {
      nickname: user.nickname,
      imgUrl: user.image.url,
      level: user.level,
      statusMessage: user.statusMessage,
    };
    return responseDto;
  }

  //get user info
  async getUserInfo(getDto: GetUserDetailDto): Promise<UserInfoDto> {
    const userFromMemory = this.users.get(getDto.nickname);
    if (userFromMemory) {
      const responseDto: UserInfoDto = {
        id: userFromMemory.id,
        nickname: userFromMemory.nickname,
        roleType: userFromMemory.roleType,
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
      roleType: userFromDatabase.roleType,
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

  async getUserImages(): Promise<ProfileImagesDto> {
    const profileImages: ProfileImage[] = await this.profileImageRepository.findAll();
    const imageDtos: ProfileImageDto[] = profileImages.map((profileImages) => {
      return { id: profileImages.id, url: profileImages.url };
    });
    const responseDto: ProfileImagesDto = {
      images: imageDtos,
    }
    return responseDto;
  }
}
