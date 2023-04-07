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
import { PatchUsersDetailDto } from './dto/patch.users.detail.dto';
import { UsersTitlesDto } from './dto/users.titles.dto';
import { GetUsersDetailDto } from './dto/get.users.detail.dto';
import { GetUsersTitlesDto } from './dto/get.users.titles.dto';
import { UserSelectedTitleDto } from './dto/user.selected.title.dto';
import { PatchUsersTitleDto } from './dto/patch.users.title.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,
  ) {}

  //get detail service
  async usersDetailByDtoGet(
    getDto: GetUsersDetailDto,
  ): Promise<UsersDetailDto> {
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

  async userSelectedTitleByDtoGet(
    getDto: GetUsersTitlesDto,
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
  async usersDetailByDtoPatch(patchDto: PatchUsersDetailDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { nickname: patchDto.nickname },
    });
    if (!user) throw new NotFoundException('No such User');
    user.nickname = patchDto.nickname;
    user.imageUrl = patchDto.imgUrl;
    user.statusMessage = patchDto.message;
    await this.userRepository.save(user);
  }

  async usersTitleIdByDtoPatch(patchDto: PatchUsersTitleDto): Promise<void> {
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

  //get title service
  async usersTitlesByNicknameGet(
    getDto: GetUsersTitlesDto,
  ): Promise<UsersTitlesDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: getDto.nickname },
    });
    if (!user) throw new NotFoundException('no such user');
    const userTitles = await this.userTitleRepository.find({
      where: { user: { id: user.id } },
    });

    const titles = userTitles.map((userTitle) => {
      return { id: userTitle.title.id, title: userTitle.title.name };
    });
    const responseDto: UsersTitlesDto = {
      titles: titles,
    };
    return responseDto;
  }
}
