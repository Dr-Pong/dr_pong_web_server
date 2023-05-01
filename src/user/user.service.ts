import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from './user.entity';
import { UserDetailDto } from './dto/user.detail.dto';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserSelectedTitleDto } from './dto/user.selected.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import { UserInfoDto } from './dto/user.info.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  users: Map<string, User> = new Map();

  //get detail service
  async getUsersDetail(getDto: GetUserDetailDto): Promise<UserDetailDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: getDto.nickname },
    });
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
      }
      return responseDto;
    }

    const userFromDatabase = await this.userRepository.findOne({
      where: { nickname: getDto.nickname },
    });
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
  async patchUserDetail(patchDto: PatchUserDetailDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { nickname: patchDto.nickname },
    });
    if (!user) throw new NotFoundException('No such User');
    user.imageUrl = patchDto.imgUrl;
    user.statusMessage = patchDto.statusMessage;
    await this.userRepository.save(user);
  }
}
