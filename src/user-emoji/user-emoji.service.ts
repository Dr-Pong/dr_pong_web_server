import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEmoji } from './user-emoji.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Emoji } from 'src/emoji/emoji.entity';
import { GetUserEmojisDto } from './dto/get.user.emojis.dto';
import { UserEmojiDto, UseremojisDto } from './dto/user.emojis.dto';
import { UserCollectablesStatus } from 'src/global/utils/user.collectable';
import { PatchUserEmojisDto } from './dto/patch.user.emojis.dto';
import { COLLECTABLE_SELECTED } from 'src/global/type/type.collectable.status';
import { UserEmojiRepository } from './user-emoji.repository';
import { EmojiRepository } from 'src/emoji/emoji.repository';

@Injectable()
export class UserEmojiService {
  constructor(
    private readonly userEmojiRepository: UserEmojiRepository,
    private readonly emojiRepository: EmojiRepository,
  ) {}

  async getUseremojisAll(getDto: GetUserEmojisDto): Promise<UseremojisDto> {
    const allEmoji: Emoji[] = await this.emojiRepository.findAll();
    const userEmoji: UserEmoji[] = await this.userEmojiRepository.findAllByUserId(getDto.userId);

    const emojis: UserEmojiDto[] = [];
    const status = new UserCollectablesStatus(allEmoji.length);
    status.setStatus(userEmoji);

    for (const c of allEmoji) {
      emojis.push({
        id: c.id,
        name: c.name,
        imgUrl: c.imageUrl,
        status: status.getStatus(c.id),
      });
    }
    const responseDto: UseremojisDto = {
      emojis: emojis,
    };
    return responseDto;
  }

  //getUseremojis함수
  async getUseremojisSelected(
    getDto: GetUserEmojisDto,
  ): Promise<UseremojisDto> {
    const selectedEmoji = await this.userEmojiRepository.findAllByUserIdAndSelected(getDto.userId);

    const emojis: UserEmojiDto[] = [null, null, null, null];
    for (const userEmoji of selectedEmoji) {
      emojis[userEmoji.selectedOrder] = {
        id: userEmoji.emoji.id,
        name: userEmoji.emoji.name,
        imgUrl: userEmoji.emoji.imageUrl,
        status: COLLECTABLE_SELECTED,
      };
    }
    const responseDto: UseremojisDto = {
      emojis: emojis,
    };
    return responseDto;
  }

  //patchUseremojis함수
  async patchUseremojis(patchDto: PatchUserEmojisDto): Promise<void> {
    const oldEmojis: UserEmoji[] = await this.userEmojiRepository.findAllByUserIdAndSelected(patchDto.userId);
    for (const c of oldEmojis) {
      await this.userEmojiRepository.updateSelectedOrderNull(c);
    }

    const toChangeEmojis: UserEmoji[] = await this.userEmojiRepository.findAllByUserIdAndEmojiIds(patchDto.userId, patchDto.emojisId);

    const countNumbers = patchDto.emojisId.filter(
			(elem) => typeof elem === 'number',
		).length;
		if (countNumbers !== toChangeEmojis.length) {
			throw new BadRequestException('No such emoji');
    }

    for (const c of toChangeEmojis) {
      let i = 0;
      for (const d of patchDto.emojisId) {
        if (c.emoji.id === d) {
          await this.userEmojiRepository.updateSelectedOrder(c, i);
          break;
        }
        i++;
      }
    }
  }
}
