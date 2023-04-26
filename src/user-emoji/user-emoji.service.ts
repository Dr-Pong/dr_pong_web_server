import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEmoji } from './user-emoji.entity';
import { In, Not, Repository } from 'typeorm';
import { Emoji } from 'src/emoji/emoji.entity';
import { GetUserEmojisDto } from './dto/get.user.emojis.dto';
import { UserEmojiDto, UseremojisDto } from './dto/user.emojis.dto';
import { UserCollectablesStatus } from 'src/global/utils/user.collectable';
import { CollectableStatus } from 'src/global/type/enum.collectable.status';
import { PatchUserEmojisDto } from './dto/patch.user.emojis.dto';

@Injectable()
export class UserEmojiService {
  constructor(
    @InjectRepository(UserEmoji)
    private userEmojiRepository: Repository<UserEmoji>,
    @InjectRepository(Emoji)
    private emojiRepository: Repository<Emoji>,
  ) {}
  //getUseremojis함수
  async getUseremojis(getDto: GetUserEmojisDto): Promise<UseremojisDto> {
    if (getDto.isSelected) {
      const selectedEmoji = await this.userEmojiRepository.find({
        where: { user: { id: getDto.userId }, selectedOrder: Not(null) },
      });
      const emojis: UserEmojiDto[] = [];
      for (const userEmoji of selectedEmoji) {
        emojis.push({
          id: userEmoji.emoji.id,
          name: userEmoji.emoji.name,
          status: CollectableStatus.SELECTED,
        });
      }
      const responseDto: UseremojisDto = {
        emojis: emojis,
      };
      return responseDto;
    }
    const allEmoji = await this.emojiRepository.find();
    const userEmoji = await this.userEmojiRepository.find({
      where: { user: { id: getDto.userId } },
    });
    const emojis: UserEmojiDto[] = [];
    const status = new UserCollectablesStatus(allEmoji.length);
    status.setStatus(userEmoji);
    for (const c of allEmoji) {
      emojis.push({
        id: c.id,
        name: c.name,
        status: status.getStatus(c.id),
      });
    }
    const responseDto: UseremojisDto = {
      emojis: emojis,
    };
    return responseDto;
  }

  //patchUseremojis함수
  async patchUseremojis(patchDto: PatchUserEmojisDto): Promise<void> {
    const old_emojis: UserEmoji[] = await this.userEmojiRepository.find({
      where: {
        user: { id: patchDto.userId },
        selectedOrder: Not(null),
      },
    });
    const to_change_emojis: UserEmoji[] = await this.userEmojiRepository.find({
      where: {
        user: { id: patchDto.userId },
        emoji: In(patchDto.emojisId),
      },
    });
    if (to_change_emojis.length !== patchDto.emojisId.length) {
      throw new BadRequestException('No such emojis');
    }
    for (const c of old_emojis) {
      c.selectedOrder = null;
    }
    /*
      원하는 것
      - patchDto의 n 번째 인자로 x이라는 id가 들어오면 x 이모지의 order를 n으로 설정한다
      
    */
    for (const c of to_change_emojis) {
      let i = 0;
      for (const d of patchDto.emojisId) {
        if (c.emoji.id === d) {
          c.selectedOrder = i;
          break;
        }
        i++;
      }
    }
    await this.userEmojiRepository.save(old_emojis);
    await this.userEmojiRepository.save(to_change_emojis);
  }
}
