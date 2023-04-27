import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserTitle } from './user-title.entity';
import { UserTitlesDto } from 'src/user-title/dto/user.titles.dto';
import { GetUserTitlesDto } from './dto/get.user.titles.dto';
import { PatchUserTitleDto } from 'src/user-title/dto/patch.user.title.dto';

@Injectable()
export class UserTitleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,
  ) {}

  //get title service
  async getUserTitles(getDto: GetUserTitlesDto): Promise<UserTitlesDto> {
    const userTitles = await this.userTitleRepository.find({
      where: { user: { id: getDto.userId } },
    });

    const titles = userTitles.map((userTitle) => {
      return { id: userTitle.title.id, title: userTitle.title.name };
    });
    const responseDto: UserTitlesDto = {
      titles: titles,
    };
    return responseDto;
  }

  //patch user title
  async patchUserTitle(patchDto: PatchUserTitleDto): Promise<void> {
    const oldTitle = await this.userTitleRepository.findOne({
      where: { user: { nickname: patchDto.nickname }, isSelected: true },
    });
    if (oldTitle) {
      oldTitle.isSelected = false;
      await this.userTitleRepository.save(oldTitle);
    }

    const newTitle = await this.userTitleRepository.findOne({
      where: {
        user: { nickname: patchDto.nickname },
        title: { id: patchDto.titleId },
      },
    });
    if (!newTitle) {
      throw new BadRequestException('No such title');
    }
    newTitle.isSelected = true;
    await this.userTitleRepository.save(newTitle);
  }
}
