import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserTitle } from './user-title.entity';
import { UserTitlesDto } from 'src/user-title/dto/user.titles.dto';
import { GetUserTitlesDto } from './dto/get.user.titles.dto';

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
}
