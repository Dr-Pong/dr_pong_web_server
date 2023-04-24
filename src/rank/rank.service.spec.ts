import { Test, TestingModule } from '@nestjs/testing';
import { RankService } from './rank.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Rank } from './rank.entity';
import { Season } from 'src/season/season.entity';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetUserRankStatDto } from './dto/get.user.rank.stat.dto';
import { GetUserBestRankStatDto } from './dto/get.user.best.rnak.stat.dto';

describe('RankService', () => {
  let service: RankService;
  let dataSources: DataSource;
  let userRepository: Repository<User>;
  let rankRepository: Repository<Rank>;
  let seasonRepository: Repository<Season>;
  let users: User[];
  let seasons: Season[];
  //game 레포 + user-game레포 넣기

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        RankService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Rank),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Season),
          useClass: Repository,
        },
        //여기도 game + user-game레포넣기
      ],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rankRepository = module.get<Repository<Rank>>(getRepositoryToken(Rank));
    seasonRepository = module.get<Repository<Season>>(
      getRepositoryToken(Season),
    );
    //game + user-game레포 대입(대학입시아님)하기
    dataSources = module.get<DataSource>(DataSource);
    service = module.get<RankService>(RankService);

    //유저 3명 생성
    users = await userRepository.save([
      {
        nickname: 'testnick1',
        email: 'testemail1',
        imageUrl: 'testurl1',
        level: 1,
        statusMessage: 'testmessage1',
      },
      {
        nickname: 'testnick2',
        email: 'testemail2',
        imageUrl: 'testurl2',
        level: 2,
        statusMessage: 'testmessage2',
      },
      {
        nickname: 'testnick3',
        email: 'testemail3',
        imageUrl: 'testurl3',
        level: 3,
        statusMessage: 'testmessage3',
      },
    ]);

    //시즌 10개 생성
    seasons = await seasonRepository.save([
      {
        name: 'testseason1',
        startTime: '2021-01-01',
        endTime: '2021-01-08',
        imageUrl: 'testurl1',
      },
      {
        name: 'testseason2',
        startTime: '2022-01-01',
        endTime: '2022-01-08',
        imageUrl: 'testurl2',
      },
      {
        name: 'testseason3',
        startTime: '2023-01-01',
        endTime: '2023-01-08',
        imageUrl: 'testurl3',
      },
      {
        name: 'testseason4',
        startTime: '2024-01-01',
        endTime: '2024-01-08',
        imageUrl: 'testurl4',
      },
    ]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 현시즌 랭크 데이터 반환', async () => {
    //given
    const savedRank = await rankRepository.save([
      {
        user: users[0],
        season: seasons[0],
        ladderRank: 10,
        ladderPoint: 1100,
        highestRanking: 1,
        highestPoint: 1111,
      },
      {
        user: users[0],
        season: seasons[1],
        ladderRank: 20,
        ladderPoint: 2200,
        highestRanking: 2,
        highestPoint: 2222,
      },
      {
        user: users[0],
        season: seasons[2],
        ladderRank: 3300,
        ladderPoint: 3300,
        highestRanking: 3,
        highestPoint: 3333,
      },
    ]);
    //Dto로 반환할때는 rank, bestRank만 반환하도록 수정해야함
    const getDto1: GetUserRankStatDto = {
      userId: users[0].id,
      seasonId: seasons[0].id,
    }; // 시즌1데이터
    const getDto2: GetUserRankStatDto = {
      userId: users[0].id,
      seasonId: seasons[1].id,
    }; // 시즌2데이터
    const getDto3: GetUserRankStatDto = {
      userId: users[0].id,
      seasonId: seasons[2].id,
    }; // 시즌3데이터
    const invalidgetDto1: GetUserRankStatDto = {
      userId: users[0].id,
      seasonId: seasons[3].id,
    }; // 유저의 없는시즌 데이터 BadRequest
    const invalidgetDto2: GetUserRankStatDto = {
      userId: users[2].id,
      seasonId: seasons[0].id,
    }; // 유저의 없는시즌 데이터 2 BadRequest

    //when
    const result1 = await service.getUserRankBySeason(getDto1);
    const result2 = await service.getUserRankBySeason(getDto2);
    const result3 = await service.getUserRankBySeason(getDto3);

    //then
    expect(result1.rank).toEqual(savedRank[0].ladderRank);
    expect(result2.rank).toEqual(savedRank[1].ladderRank);
    expect(result3.rank).toEqual(savedRank[2].ladderRank);

    expect(result1.record).toEqual(savedRank[0].ladderPoint);
    expect(result2.record).toEqual(savedRank[1].ladderPoint);
    expect(result3.record).toEqual(savedRank[2].ladderPoint);

    await expect(service.getUserRankBySeason(invalidgetDto1)).rejects.toThrow(
      new BadRequestException('No Rank Data'),
    );
    await expect(service.getUserRankBySeason(invalidgetDto2)).rejects.toThrow(
      new BadRequestException('No Rank Data'),
    );
  });

  it('유저 시즌 최고점 랭크데이터 반환', async () => {
    //given
    const savedBestRank = await rankRepository.save([
      {
        user: users[0],
        season: seasons[0],
        ladderRank: 10,
        ladderPoint: 1100,
        highestRanking: 11,
        highestPoint: 1111,
      },
      {
        user: users[0],
        season: seasons[1],
        ladderRank: 20,
        ladderPoint: 2200,
        highestRanking: 2,
        highestPoint: 2222,
      },
      {
        user: users[0],
        season: seasons[2],
        ladderRank: 3300,
        ladderPoint: 3300,
        highestRanking: 3,
        highestPoint: 3333,
      },
      {
        user: users[1],
        season: seasons[0],
        ladderRank: 3300,
        ladderPoint: 3300,
        highestRanking: 3,
        highestPoint: 3333,
      },
    ]);

    //Dto로 반환할때는 highestRank, highestPoint만 반환하도록 수정해야함
    const getDto1: GetUserBestRankStatDto = {
      userId: users[0].id,
    }; // 시즌1데이터
    const getDto2: GetUserBestRankStatDto = {
      userId: users[0].id,
    }; // 시즌2데이터
    const getDto3: GetUserBestRankStatDto = {
      userId: users[0].id,
    }; // 시즌3데이터
    const getDto4: GetUserBestRankStatDto = {
      userId: users[1].id,
    };
    const invalidgetDto1: GetUserBestRankStatDto = {
      userId: users[2].id,
    }; // 없는시즌 데이터 BadRequest

    //when
    const result1 = await service.getUserBestRank(getDto1);
    const result2 = await service.getUserBestRank(getDto2);
    const result3 = await service.getUserBestRank(getDto3);
    const result4 = await service.getUserBestRank(getDto4);

    //then
    expect(result1.rank).toEqual(savedBestRank[1].highestRanking);
    expect(result2.rank).toEqual(savedBestRank[1].highestRanking);
    expect(result3.rank).toEqual(savedBestRank[1].highestRanking);
    expect(result4.rank).toEqual(savedBestRank[3].highestRanking);

    expect(result1.record).toEqual(savedBestRank[1].highestPoint);
    expect(result2.record).toEqual(savedBestRank[1].highestPoint);
    expect(result3.record).toEqual(savedBestRank[1].highestPoint);
    expect(result4.record).toEqual(savedBestRank[3].highestPoint);

    await expect(service.getUserBestRank(invalidgetDto1)).rejects.toThrow(
      new BadRequestException('No BEST Rank Data'),
    );
  });
});
