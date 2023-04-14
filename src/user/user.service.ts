import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from './user.entity';
import { UsersDetailDto } from './dto/users.detail.dto';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { UserTitlesDto } from './dto/user.titles.dto';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserSelectedTitleDto } from './dto/user.selected.title.dto';
import { PatchUsersTitleDto } from './dto/patch.users.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,
  ) {}

  //get detail service
  async getUsersDetail(getDto: GetUserDetailDto): Promise<UsersDetailDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: getDto.nickname },
    });
    if (!user) throw new NotFoundException('No such User');

    const responseDto: UsersDetailDto = {
      nickname: user.nickname,
      imgUrl: user.imageUrl,
      level: user.level,
      statusMessage: user.statusMessage,
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

  //patch user title
  async patchUserTitle(patchDto: PatchUsersTitleDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { nickname: patchDto.nickname },
    });
    if (!user) throw new NotFoundException('No such User');

    const old_title = await this.userTitleRepository.findOne({
      where: { user: { id: user.id }, isSelected: true },
    });
    const to_change = await this.userTitleRepository.findOne({
      where: { user: { id: user.id }, title: { id: patchDto.titleId } },
    });
    if (!to_change) throw new BadRequestException('No such Title');

    if (old_title) {
      old_title.isSelected = false;
      await this.userTitleRepository.save(old_title);
    }
    to_change.isSelected = true;
    await this.userTitleRepository.save(to_change);
  }
}
