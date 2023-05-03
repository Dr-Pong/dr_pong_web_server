import { Test, TestingModule } from '@nestjs/testing';
import { RankService } from './rank.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Rank } from './rank.entity';
import { Season } from 'src/season/season.entity';
import { AppModule } from 'src/app.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rnak.stat.dto';
import { TestService } from 'src/test/test.service';
import { TestModule } from 'src/test/test.module';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { RankModule } from './rank.module';
import { RanksTopDto } from './dto/ranks.top.dto';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { RanksBottomDto } from './dto/ranks.bottom.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import { GetRanksTopImageDto } from './dto/get.ranks.top.image.dto';
import { RanksTopImageDto } from './dto/ranks.top.image.dto';

describe('RankService', () => {
  let service: RankService;
  let testData: TestService;
  let dataSources: DataSource;
  let rankRepository: Repository<Rank>;

  //game 레포 + user-game레포 넣기

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeORMConfig), RankModule, TestModule],
      providers: [
        {
          provide: getRepositoryToken(Rank),
          useClass: Repository,
        },
      ],
    }).compile();

    rankRepository = module.get<Repository<Rank>>(getRepositoryToken(Rank));
    dataSources = module.get<DataSource>(DataSource);
    service = module.get<RankService>(RankService);
    testData = module.get<TestService>(TestService);

    await testData.createBasicSeasons(3);
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicUser();
    await testData.createBasicRank();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 현시즌 랭크 데이터 반환', async () => {
    //given

    //Dto로 반환할때는 rank, bestRank만 반환하도록 수정해야함
    const getDto1: GetUserRankStatDto = {
      userId: testData.ranks[0].user.id,
      seasonId: testData.seasons[0].id,
    }; // 시즌1데이터
    const getDto2: GetUserRankStatDto = {
      userId: testData.ranks[0].user.id,
      seasonId: testData.seasons[1].id,
    }; // 시즌2데이터
    const getDto3: GetUserRankStatDto = {
      userId: testData.ranks[0].user.id,
      seasonId: testData.seasons[2].id,
    }; // 시즌3데이터
    const invalidgetDto1: GetUserRankStatDto = {
      userId: testData.ranks[0].user.id,
      seasonId: 4,
    }; // 없는시즌 데이터
    const invalidgetDto2: GetUserRankStatDto = {
      userId: 4,
      seasonId: testData.seasons[0].id,
    }; // 없는유저 데이터

    //when
    const result1 = await service.getUserRankBySeason(getDto1);
    const result2 = await service.getUserRankBySeason(getDto2);
    const result3 = await service.getUserRankBySeason(getDto3);
    const result4 = await service.getUserRankBySeason(invalidgetDto1);
    const result5 = await service.getUserRankBySeason(invalidgetDto2);

    //then

    //랭크데이터가 잘 반환되는지 확인
    expect(result1.record).toEqual(testData.ranks[0].ladderPoint);
    expect(result2.record).toEqual(testData.ranks[1].ladderPoint);
    expect(result3.record).toEqual(testData.ranks[2].ladderPoint);

    //없는시즌 데이터는 null로 반환
    expect(result4).toEqual({ record: null });
    expect(result5).toEqual({ record: null });
  });

  it('유저 시즌 최고점 랭크데이터 반환', async () => {
    //given
    //Dto로 반환할때는 highestRank, highestPoint만 반환하도록 수정해야함
    const getDto1: GetUserBestRankStatDto = {
      userId: testData.ranks[0].user.id,
    }; // 시즌1데이터
    const getDto2: GetUserBestRankStatDto = {
      userId: testData.ranks[0].user.id,
    }; // 시즌2데이터
    const getDto3: GetUserBestRankStatDto = {
      userId: testData.ranks[0].user.id,
    }; // 시즌3데이터
    const getDto4: GetUserBestRankStatDto = {
      userId: testData.ranks[1].user.id,
    }; // 시즌2데이터
    const invalidgetDto1: GetUserBestRankStatDto = {
      userId: 4,
    }; // 없는시즌 데이터 BadRequest

    //when
    const result1 = await service.getUserBestRank(getDto1);
    const result2 = await service.getUserBestRank(getDto2);
    const result3 = await service.getUserBestRank(getDto3);
    const result4 = await service.getUserBestRank(getDto4);
    const result5 = await service.getUserBestRank(invalidgetDto1);

    //then
    expect(result1.record).toEqual(testData.ranks[0].highestPoint); //시즌1데이터
    expect(result2.record).toEqual(testData.ranks[1].highestPoint); //시즌2데이터
    expect(result3.record).toEqual(testData.ranks[2].highestPoint); //시즌3데이터
    expect(result4.record).toEqual(testData.ranks[1].highestPoint); //시즌2데이터

    //없는시즌 데이터는 null로 반환
    expect(result5).toEqual({ record: null });
  });

  it('count에 따른 Top 랭크데이터 반환', async () => {
    const topRankDto: GetRanksTopDto = {
      count: 10,
    };

    const topRankResult = await service.getTopRanksByCount(topRankDto); //top[rank, nickname, ladderPoint] 반환

    expect(topRankResult.length).toEqual(10);
    expect(topRankResult[0].rank).toEqual(1);
    expect(topRankResult[0].nickname).toEqual(testData.ranks[0].user.nickname);
    expect(topRankResult[0].ladderPoint).toEqual(testData.ranks[0].ladderPoint);
    expect(topRankResult[0].image).toEqual(testData.ranks[0].user.imageUrl);

    expect(topRankResult[1].rank).toEqual(2);
    expect(topRankResult[1].nickname).toEqual(testData.ranks[1].user.nickname);
    expect(topRankResult[1].ladderPoint).toEqual(testData.ranks[1].ladderPoint);
    expect(topRankResult[1].image).toEqual(testData.ranks[1].user.imageUrl);
  });

  it('count에 따른 Bottom 랭크데이터 반환', async () => {
    const bottomRankDto: GetRanksBottomDto = {
      count: 10,
      offset: 4,
    };

    const bottomRankResult = await service.getBottomRanksByCount(bottomRankDto); //top[rank, nickname, ladderPoint] 반환

    expect(bottomRankResult.length).toEqual(bottomRankDto.count);
    expect(bottomRankResult[0].rank).toEqual(bottomRankDto.offset);
    expect(bottomRankResult[0].nickname).toEqual(
      testData.ranks[4].user.nickname,
    );
    expect(bottomRankResult[0].ladderPoint).toEqual(
      testData.ranks[4].ladderPoint,
    );

    expect(bottomRankResult[1].rank).toEqual(bottomRankDto.offset + 1);
    expect(bottomRankResult[1].nickname).toEqual(
      testData.ranks[5].user.nickname,
    );
    expect(bottomRankResult[1].ladderPoint).toEqual(
      testData.ranks[5].ladderPoint,
    );
  });
});
