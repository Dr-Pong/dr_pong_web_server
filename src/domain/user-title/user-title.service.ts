import { BadRequestException, Injectable } from '@nestjs/common';
import { Transactional, IsolationLevel } from 'typeorm-transactional';
import { UserTitle } from './user-title.entity';
import { UserTitlesDto } from 'src/domain/user-title/dto/user.titles.dto';
import { GetUserTitlesDto } from './dto/get.user.titles.dto';
import { PatchUserTitleDto } from 'src/domain/user-title/dto/patch.user.title.dto';
import { UserTitleSelectedDto } from './dto/user.title.selected.dto';
import { UserTitleRepository } from './user-title.repository';

@Injectable()
export class UserTitleService {
  constructor(private userTitleRepository: UserTitleRepository) {}

  //get title service
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserTitles(getDto: GetUserTitlesDto): Promise<UserTitlesDto> {
    const userTitles = await this.userTitleRepository.findAllByUserId(
      getDto.userId,
    );

    const titles = userTitles.map((userTitle) => {
      return { id: userTitle.title.id, title: userTitle.title.name };
    });
    const responseDto: UserTitlesDto = {
      titles: titles,
    };
    return responseDto;
  }

  //get selected title service
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async getUserTitleSelected(
    getDto: GetUserTitlesDto,
  ): Promise<UserTitleSelectedDto> {
    const userTitle = await this.userTitleRepository.findByUserIdAndSelected(
      getDto.userId,
      true,
    );
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
  @Transactional({ isolationLevel: IsolationLevel.REPEATABLE_READ })
  async patchUserTitle(patchDto: PatchUserTitleDto): Promise<void> {
    const oldTitle: UserTitle =
      await this.userTitleRepository.findByUserIdAndSelected(
        patchDto.userId,
        true,
      );
    if (oldTitle)
      await this.userTitleRepository.updateIsSelectedFalse(oldTitle);
    if (patchDto.titleId) {
      const newTitle: UserTitle =
        await this.userTitleRepository.findByUserIdAndTitleId(
          patchDto.userId,
          patchDto.titleId,
        );
      if (!newTitle) {
        throw new BadRequestException('No such title');
      }
      await this.userTitleRepository.updateIsSelectedTrue(newTitle);
    }
  }
}
