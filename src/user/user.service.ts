import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from './user.entity';
import { UserDetailDto } from './dto/user.detail.dto';
import { PatchUserImageDto } from './dto/patch.user.image.dto';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserSelectedTitleDto } from './dto/user.selected.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { JwtService } from '@nestjs/jwt';
import { GetUserMeDto } from './dto/get.user.me.dto';
import { TokenInterface } from 'src/auth/jwt/jwt.token.interface';
import {
  ROLETYPE_GUEST,
  ROLETYPE_NONAME,
} from 'src/global/type/type.user.roletype';
import { UserMeDto } from './dto/user.me.dto';
import { UserRepository } from './user.repository';
import { PatchUserMessagDto } from './dto/patch.user.message.dto';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) { }
  users: Map<string, User> = new Map();

  //get detail service
  async getUsersDetail(getDto: GetUserDetailDto): Promise<UserDetailDto> {
    const user = await this.userRepository.findByNickname(getDto.nickname);
    if (!user) throw new NotFoundException('No such User');

    const responseDto: UserDetailDto = {
      nickname: user.nickname,
      imgUrl: user.imageUrl,
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

  //patch detail service
  async patchUserImage(patchDto: PatchUserImageDto): Promise<void> {
    const user = await this.userRepository.findById(patchDto.userId);
    if (!user) throw new NotFoundException('No such User');

    await this.userRepository.updateUserImage(user, patchDto);
  }

  async patchUserStatusMessage(patchDto: PatchUserMessagDto): Promise<void> {
    const user = await this.userRepository.findById(patchDto.userId);
    if (!user) throw new NotFoundException('No such User');

    await this.userRepository.updateUserStatusMessage(user, patchDto);
  }

  async getUserMe(getDto: GetUserMeDto): Promise<UserMeDto> {
    const guestUserMeDto: UserMeDto = {
      nickname: '',
      imgUrl: '',
      isSecondAuthOn: false,
      roleType: ROLETYPE_GUEST,
    };

    const nonameUserMeDto: UserMeDto = {
      nickname: '',
      imgUrl: '',
      isSecondAuthOn: false,
      roleType: ROLETYPE_NONAME,
    };

    if (!getDto.token) {
      return guestUserMeDto;
    }

    const jwt: TokenInterface = this.jwtService.verify(getDto.token);
    if (jwt.roleType === ROLETYPE_NONAME) {
      return nonameUserMeDto;
    }

    const user = await this.userRepository.findById(jwt.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    const responseDto: UserMeDto = {
      nickname: user.nickname,
      imgUrl: user.imageUrl,
      isSecondAuthOn: user.isSecondAuthOn,
      roleType: user.roleType,
    };
    return responseDto;
  }
}
