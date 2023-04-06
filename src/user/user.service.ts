import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UsersDetailDto } from './dto/users.detail.dto';
import { UserTitle } from 'src/user-title/usertitle.entity';
import { PatchUsersDetailDto } from './dto/patch.users.detail.dto';
import { UsersTitlesDto } from './dto/users.title.dto';
import { UsersAchievementDto } from './dto/users.achievement.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userTitleRepository: Repository<UserTitle>,
	private userAcheivementsRepository: Repository<>//achievement entity
  ) {}

  async userDetailByNicknameGet(nickname: string): Promise<UsersDetailDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: nickname },
    });
    if (!user) throw new NotFoundException('No such User');
    const userTitle = await this.userTitleRepository.findOne({
      where: { user: { id: user.id }, isSelected: true },
    });
    const responseDto: UsersDetailDto = {
      nickname: user.nickname,
      imgUrl: user.imageUrl,
      level: user.level,
      title: userTitle.title.name,
      statusMessage: user.statusMessage,
    };
    return responseDto;
  } /*dto 가 nickname하나만 받는데 이걸 dto로받기보다 pathvariable로 받을것 validationpipe nickname이 string 인지 intiger인지
  detail get 함수*/

  async userDetailByDtoPatch(patchUserDetailDto: PatchUsersDetailDto) {
    const { nickname } = patchUserDetailDto; // 구조분해 할당
    const user = await this.userRepository.findOne({
      where: { nickname: nickname },
    });
    const userTitle = await this.userTitleRepository.findOne({
      where: { user: { id: user.id }, isSelected: true },
    });
    if (!user) throw new NotFoundException('No such User');
    if (patchUserDetailDto) {
      user.nickname = patchUserDetailDto.nickname;
      user.imageUrl = patchUserDetailDto.imgUrl;
      userTitle.title.id = patchUserDetailDto.titleId; // 타이틀이 id인지 확인하기
      user.statusMessage = patchUserDetailDto.message;
    }
    await this.userRepository.save(user);
    await this.userTitleRepository.save(userTitle);
  } /* detail fetch함수 */

  async userTitleGet(nickname: string): Promise<UsersTitlesDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: nickname },
    });
    if (!user) throw new NotFoundException('No such User');
    const userTitle = await this.userTitleRepository.findOne({
      where: { user: { id: user.id }, isSelected: true },
    });
    const responseDto: UsersTitlesDto = {
      id: user.id,
      title: userTitle.title.name,
    };
    return responseDto;
  } /*title get함수 */

  async userAcheivementsGet(
    nickname: string,
    isSelected: boolean,
  ): Promise<UsersAchievementDto> {
    const user = await this.userRepository.findOne({
      where: { nickname: nickname },
    });
    if (!user) throw new NotFoundException('No such User');
	const usersAchievement = await 
    const responseDto: UsersAchievementDto = {
 
    };
    return responseDto;
  } /*achievement get함수 */
}
