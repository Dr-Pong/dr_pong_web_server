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
import { UsersTitlesDto } from './dto/users.title.dto';
import { GetUsersDetailDto } from './dto/get.users.detail.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,
  ) {}

  async userDetailByNicknameGet(
    getDto: GetUsersDetailDto,
  ): Promise<UsersDetailDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: getDto.nickname },
    });
    if (!user) throw new NotFoundException('No such User');
    const userTitle = await this.userTitleRepository.findOne({
      where: { user: { id: user.id }, isSelected: true },
    });
    const responseDto: UsersDetailDto = {
      nickname: user.nickname,
      imgUrl: user.imageUrl,
      level: user.level,
      title: userTitle != null ? userTitle.title.name : null,
      statusMessage: user.statusMessage,
    };
    return responseDto;
  } /* dto 가 nickname하나만 받는데 이걸 dto로받기보다 pathvariable로 받을것 validationpipe nickname이 string 인지 intiger인지
  detail get 함수 */

  async userDetailByDtoPatch(patchDto: PatchUsersDetailDto): Promise<void> {
    const { nickname } = patchDto; // 구조분해 할당
    const user = await this.userRepository.findOne({
      where: { nickname },
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

    user.nickname = patchDto.nickname;
    user.imageUrl = patchDto.imgUrl;
    user.statusMessage = patchDto.message;
    await this.userRepository.save(user);

    to_change.isSelected = true;
    await this.userTitleRepository.save(to_change);
  } /* detail fetch함수 */
}
