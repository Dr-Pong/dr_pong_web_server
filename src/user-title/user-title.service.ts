import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserTitle } from './user-title.entity';
import {
  UserTitlesDto,
} from 'src/user-title/dto/user.titles.dto';
import { GetUserTitlesDto } from './dto/get.user.titles.dto';
import { PatchUserTitleDto } from 'src/user-title/dto/patch.user.title.dto';
import { UserTitleSelectedDto } from './dto/user.title.selected.dto';
import { UserTitleRepository } from './user-title.repository';

@Injectable()
export class UserTitleService {
  constructor(
    @InjectRepository(UserTitle)
    private userTitleRepository: UserTitleRepository,
  ) {}

  //get title service
  async getUserTitles(getDto: GetUserTitlesDto): Promise<UserTitlesDto> {
    const userTitles = await this.userTitleRepository.findAllByUserId(getDto.userId);

    const titles = userTitles.map((userTitle) => {
      return { id: userTitle.title.id, title: userTitle.title.name };
    });
    const responseDto: UserTitlesDto = {
      titles: titles,
    };
    return responseDto;
  }

  //get selected title service
  async getUserTitleSelected(
    getDto: GetUserTitlesDto,
  ): Promise<UserTitleSelectedDto> {

    const userTitle = await this.userTitleRepository.findByUserIdAndSelected(getDto.userId, true);
    if (!userTitle) {
      const responseDto = null;
      return responseDto;
    }

    const responseDto: UserTitleSelectedDto = {
      id: userTitle.title.id,
      title: userTitle.title.name,
    };
    return responseDto;
  }

  //patch user title
  async patchUserTitle(patchDto: PatchUserTitleDto): Promise<void> {
    const oldTitle: UserTitle = await this.userTitleRepository.findByUserIdAndSelected(patchDto.userId, true);
    if (oldTitle)
      await this.userTitleRepository.updateIsSelectedFalse(oldTitle);
    if (patchDto.titleId) {
      const newTitle: UserTitle = await this.userTitleRepository.findOneByUserIdAndTitleId(patchDto.userId, patchDto.titleId);    
      await this.userTitleRepository.updateIsSelectedTrue(newTitle);
    }
  }
}
