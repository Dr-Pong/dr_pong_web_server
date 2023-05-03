import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './season.entity';
import { SeasonRepository } from './season.repository';

@Module({
	imports:[],
	providers:[],
	exports:[]
})
export class SeasonModule {}
