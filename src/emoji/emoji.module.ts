import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emoji } from './emoji.entity';
import { EmojiRepository } from './emoji.repository';

@Module({})
export class EmojiModule {}
