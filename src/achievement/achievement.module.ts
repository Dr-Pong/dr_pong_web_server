import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './achievement.entity';
import { AchievementRepository } from './achievement.repository';

@Module({})
export class AchievementModule {}
