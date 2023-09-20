import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonRepository } from './season.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './season.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  providers: [SeasonRepository, SeasonService],
  exports: [],
})
export class SeasonModule {}
