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
    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,
  ) {}

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
    const userInfo = await this.userRepository.findOne({
      where: { nickname: getDto.nickname },
    });
    if (!userInfo) throw new NotFoundException('No such User');

    const responseDto: UserInfoDto = {
      id: userInfo.id,
      nickname: userInfo.nickname,
      roleType: userInfo.roleType,
    };
    return responseDto;
  }

  //get user title
  async getUserSelectedTitle(
    getDto: GetUserSelectedTitleDto,
  ): Promise<UserSelectedTitleDto> {
    const userTitle = await this.userTitleRepository.findOne({
      where: { user: { nickname: getDto.nickname }, isSelected: true },
    });
    const responseDto: UserSelectedTitleDto = {
      title: userTitle != null ? userTitle.title.name : null,
    };
    return responseDto;
  }

  //patch detail service
  async patchUserDetail(patchDto: PatchUserDetailDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { nickname: patchDto.nickname },
    });
    if (!user) throw new NotFoundException('No such User');
    user.nickname = patchDto.nickname;
    user.imageUrl = patchDto.imgUrl;
    user.statusMessage = patchDto.message;
    await this.userRepository.save(user);
  }
}
