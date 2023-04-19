import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEmoji } from './user-emoji.entity';
import { Repository } from 'typeorm';
import { Emoji } from 'src/emoji/emoji.entity';
import { GetUserEmojiesDto } from './dto/get.user.emojies.dto';
import { UserEmojiDto, UserEmojiesDto } from './dto/user.emojis.dto';
import { UserCollectablesStatus } from 'src/global/utils/user.collectable';
import { CollectableStatus } from 'src/global/type/enum.collectable.status';

@Injectable()
export class UserEmojiService {
  constructor(
    @InjectRepository(UserEmoji)
    private userEmojiRepository: Repository<UserEmoji>,
    @InjectRepository(Emoji)
    private emojiRepository: Repository<Emoji>,
  ) {}
  //getUserEmojies함수
  async getUserEmojies(getDto: GetUserEmojiesDto): Promise<UserEmojiesDto> {
    if (getDto.isSelected) {
      const selectedEmoji = await this.userEmojiRepository.find({
        where: { user: { id: getDto.userId }, isSelected: true },
      });
      const emojies: UserEmojiDto[] = [];
      for (const userEmoji of selectedEmoji) {
        emojies.push({
          id: userEmoji.emoji.id,
          name: userEmoji.emoji.name,
          status: CollectableStatus.SELECTED,
        });
      }
      const responseDto: UserEmojiesDto = {
        emojies: emojies,
      };
      return responseDto;
    }
    //이하 내일 구현할부분 setemoji getstatus 함수 만들기
    const allEmoji = await this.emojiRepository.find();
    const userEmoji = await this.userEmojiRepository.find({
      where: { user: { id: getDto.userId } },
    });
    const emojies: UserEmojiDto[] = [];
    const status = new UserCollectablesStatus(allEmoji.length);
    status.setStatus(userEmoji);
    for (const c of allEmoji) {
      emojies.push({
        id: c.id,
        name: c.name,
        status: status.getStatus(c.id),
      });
    }
    const responseDto: UserEmojiesDto = {
      emojies: emojies,
    };
    return responseDto;
  }

  //patchUserEmojies함수
}
