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
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserSelectedTitleDto } from './dto/user.selected.title.dto';
import { PatchUserTitleDto } from './dto/patch.user.title.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
