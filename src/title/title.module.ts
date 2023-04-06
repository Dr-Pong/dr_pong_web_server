import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Title } from './title.entity';

@Module({ imports: [TypeOrmModule.forFeature([Title])] })
export class TitleModule {}
