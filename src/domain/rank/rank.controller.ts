import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RankService } from './rank.service';
import { RanksTopResponseDto } from './dto/ranks.top.response.dto';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { RanksTopDto } from './dto/ranks.top.dto';
import { RanksBottomResponseDto } from './dto/ranks.bottom.resposne.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { RanksBottomDto } from './dto/ranks.bottom.dto';

@Controller('ranks')
export class RankController {
  constructor(private rankService: RankService) { }

  @Get('/top')
  async rankTopGet(
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ): Promise<RanksTopResponseDto> {
    console.log(count);
    const getRanksTopDto: GetRanksTopDto = { count };
    const topRanks: RanksTopDto = await this.rankService.getTopRanksByCount(
      getRanksTopDto,
    );
    const responseDto: RanksTopResponseDto = {
      top: topRanks.top,
    };
    console.log(responseDto);
    return responseDto;
  }

  @Get('/bottom')
  async rankBottomGet(
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
    @Query('offset', new DefaultValuePipe(4), ParseIntPipe) offset: number,
  ): Promise<RanksBottomResponseDto> {
    console.log(count, offset);
    const getRanksBottomDto: GetRanksBottomDto = { count, offset };
    const bottomRanks: RanksBottomDto =
      await this.rankService.getBottomRanksByCount(getRanksBottomDto);
    const responseDto: RanksBottomResponseDto = {
      bottom: bottomRanks.bottom,
    };
    console.log(responseDto);
    return responseDto;
  }
}
