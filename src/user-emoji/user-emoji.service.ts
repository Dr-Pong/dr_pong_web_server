import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEmoji } from './user-emoji.entity';
import { In, Repository } from 'typeorm';
import { Emoji } from 'src/emoji/emoji.entity';
import { GetUserEmojiesDto } from './dto/get.user.emojies.dto';
import { UserEmojiDto, UserEmojiesDto } from './dto/user.emojis.dto';
import { UserCollectablesStatus } from 'src/global/utils/user.collectable';
import { CollectableStatus } from 'src/global/type/enum.collectable.status';
import { PatchUserEmojiesDto } from './dto/patch.user.emojies.dto';

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
  async patchUserEmojies(patchDto: PatchUserEmojiesDto): Promise<void> {
    const old_emojies: UserEmoji[] = await this.userEmojiRepository.find({
      where: { user: { id: patchDto.userId }, isSelected: true },
    });
    const to_change_emojies: UserEmoji[] = await this.userEmojiRepository.find({
      where: {
        user: { id: patchDto.userId },
        emoji: In(patchDto.emojiesId),
      },
    });
    if (to_change_emojies.length !== patchDto.emojiesId.length) {
      throw new BadRequestException('No such Emojies');
    }
    for (const c of old_emojies) {
      if (c.isSelected === true) {
        c.isSelected = false;
      }
      await this.userEmojiRepository.save(c);
    }
    for (const c of to_change_emojies) {
      c.isSelected = true;
    }
    await this.userEmojiRepository.save(to_change_emojies);
  }
}
