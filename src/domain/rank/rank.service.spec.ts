import { Test, TestingModule } from '@nestjs/testing';
import { RankService } from './rank.service';
import { DataSource, Repository } from 'typeorm';
import { Rank } from './rank.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rank.stat.dto';
import { TestService } from 'src/test/test.service';
import { TestModule } from 'src/test/test.module';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { RankModule } from './rank.module';
import { RanksTopDto } from './dto/ranks.top.dto';
import { GetRanksTopDto } from './dto/get.ranks.top.count.dto';
import { GetRanksBottomDto } from './dto/get.ranks.bottom.dto';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';

describe('RankService', () => {
  let service: RankService;
  let testData: TestService;
  let dataSources: DataSource;
  initializeTransactionalContext();

  //game 레포 + user-game레포 넣기
  beforeAll(async () => {
    // dotenv.config();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory() {
            return typeORMConfig;
          },
          async dataSourceFactory(options) {
            if (!options) {
              throw new Error('Invalid options passed');
            }
            return addTransactionalDataSource({
              dataSource: new DataSource(options),
            });
          },
        }),
        RankModule,
        TestModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(Rank),
          useClass: Repository,
        },
      ],
    }).compile();

    dataSources = module.get<DataSource>(DataSource);
    service = module.get<RankService>(RankService);
    testData = module.get<TestService>(TestService);
  });

  beforeEach(async () => {
    await testData.createBasicSeasons(1);
    await testData.createProfileImages();
    await testData.createBasicUsers();
    await testData.createBasicRank();
    await testData.createBasicGames();
  });

  afterEach(async () => {
    testData.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 현시즌 record rank tier반환', async () => {
    //given
    const getDto1: GetUserRankStatDto = {
      userId: testData.users[0].id,
    };
    const getDto2: GetUserRankStatDto = {
      userId: testData.users[1].id,
    };
    const getDto3: GetUserRankStatDto = {
      userId: testData.users[2].id,
    };

    //when
    const recordRankTier = await service.getUserRankBySeason(getDto1);
    const recordRankTier2 = await service.getUserRankBySeason(getDto2);
    const recordRankTier3 = await service.getUserRankBySeason(getDto3);

    let testTier: string;
    switch (true) {
      case testData.ranks[0].ladderPoint >= Number(process.env.DOCTOR_CUT):
        testTier = 'doctor';
        break;
      case testData.ranks[0].ladderPoint >= Number(process.env.MASTER_CUT):
        testTier = 'master';
        break;
      case testData.ranks[0].ladderPoint >= Number(process.env.BACHELOR_CUT):
        testTier = 'bachelor';
        break;
      default:
        testTier = 'student';
    }
    // console.log(testData.ranks);
    //랭크데이터가 잘 반환되는지 확인
    expect(recordRankTier.record).toEqual(testData.ranks[0].ladderPoint);
    expect(recordRankTier2.record).toEqual(testData.ranks[1].ladderPoint);
    console.log(recordRankTier);
    console.log(recordRankTier2);
    console.log(recordRankTier3);
    expect(recordRankTier.rank).toEqual(1);
    expect(recordRankTier2.rank).toEqual(2);
    expect(recordRankTier3.rank).toEqual(3);
    expect(recordRankTier.tier).toEqual(testTier);
  });

  it('유저의 역대최고 record rank tier반환', async () => {
    const getDto1: GetUserBestRankStatDto = {
      userId: testData.users[0].id,
    }; // user1의 역대최고 랭크데이터

    const invalidgetDto1: GetUserBestRankStatDto = {
      userId: 4242,
    }; // 없는시즌 데이터 BadRequest

    const recordRankTier = await service.getUserBestRank(getDto1);
    const invalidRecordRankTier = await service.getUserBestRank(invalidgetDto1);

    let testTier: string;
    switch (true) {
      case testData.ranks[0].highestPoint >= Number(process.env.DOCTOR_CUT):
        testTier = 'doctor';
        break;
      case testData.ranks[0].highestPoint >= Number(process.env.MASTER_CUT):
        testTier = 'master';
        break;
      case testData.ranks[0].highestPoint >= Number(process.env.BACHELOR_CUT):
        testTier = 'bachelor';
        break;
      default:
        testTier = 'student';
    }

    //랭크데이터가 잘 반환되는지 확인
    expect(recordRankTier.record).toEqual(testData.ranks[0].highestPoint);
    expect(recordRankTier.rank).toEqual(null);
    expect(recordRankTier.tier).toEqual(testTier);

    //없는시즌 데이터는 null로 반환
    expect(invalidRecordRankTier).toEqual({
      record: null,
      rank: null,
      tier: 'egg',
    });
  });

  it('count에 따른 Top 랭크데이터 반환', async () => {
    const topRankDto: GetRanksTopDto = {
      count: 10,
    };

    const topRankResult: RanksTopDto = await service.getTopRanksByCount(
      topRankDto,
    ); //top[rank, nickname, ladderPoint] 반환

    expect(topRankResult.top[0].rank).toEqual(1);
    expect(topRankResult.top[0].nickname).toEqual(
      testData.ranks[0].user.nickname,
    );
    expect(topRankResult.top[0].lp).toEqual(testData.ranks[0].ladderPoint);
    expect(topRankResult.top[0].imageUrl).toEqual(
      testData.ranks[0].user.image.url,
    );

    expect(topRankResult.top[2].rank).toEqual(3);
    expect(topRankResult.top[2].nickname).toEqual(
      testData.ranks[2].user.nickname,
    );
    expect(topRankResult.top[2].lp).toEqual(testData.ranks[2].ladderPoint);
    expect(topRankResult.top[2].imageUrl).toEqual(
      testData.ranks[2].user.image.url,
    );

    expect(topRankResult.top[9].rank).toEqual(10);
    expect(topRankResult.top[9].nickname).toEqual(
      testData.ranks[9].user.nickname,
    );
    expect(topRankResult.top[9].lp).toEqual(testData.ranks[9].ladderPoint);
    expect(topRankResult.top[9].imageUrl).toEqual(
      testData.ranks[9].user.image.url,
    );
  });

  it('count에 따른 Bottom 랭크데이터 반환', async () => {
    await testData.createCurrentSeasonRank();
    const bottomRankDto: GetRanksBottomDto = {
      count: 5,
      offset: 4,
    };

    const bottomRankResult = await service.getBottomRanksByCount(bottomRankDto); //top[rank, nickname, ladderPoint] 반환

    expect(bottomRankResult.bottom[0].rank).toEqual(4);
    expect(bottomRankResult.bottom[0].nickname).toEqual(
      testData.currentSeasonRanks[3].user.nickname,
    );
    expect(bottomRankResult.bottom[0].lp).toEqual(
      testData.currentSeasonRanks[3].ladderPoint,
    );

    expect(bottomRankResult.bottom[2].rank).toEqual(6);
    expect(bottomRankResult.bottom[2].nickname).toEqual(
      testData.currentSeasonRanks[5].user.nickname,
    );
    expect(bottomRankResult.bottom[2].lp).toEqual(
      testData.currentSeasonRanks[5].ladderPoint,
    );

    expect(bottomRankResult.bottom[4].rank).toEqual(8);
    expect(bottomRankResult.bottom[4].nickname).toEqual(
      testData.currentSeasonRanks[7].user.nickname,
    );
    expect(bottomRankResult.bottom[4].lp).toEqual(
      testData.currentSeasonRanks[7].ladderPoint,
    );
  });
});
