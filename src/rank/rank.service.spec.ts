import { Test, TestingModule } from '@nestjs/testing';
import { RankService } from './rank.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Rank } from './rank.entity';
import { Season } from 'src/season/season.entity';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
        imageUrl: 'testurl1',
      },
      {
        name: 'testseason2',
        startTime: '2022-01-01',
        imageUrl: 'testurl2',
      },
      {
        name: 'testseason3',
        startTime: '2023-01-01',
        imageUrl: 'testurl3',
      },
      {
        name: 'testseason4',
        startTime: '2024-01-01',
        imageUrl: 'testurl4',
      },
      {
        name: 'testseason5',
        startTime: '2025-01-01',
        imageUrl: 'testurl5',
      },
      {
        name: 'testseason6',
        startTime: '2026-01-01',
        imageUrl: 'testurl6',
      },
      {
        name: 'testseason7',
        startTime: '2027-01-01',
        imageUrl: 'testurl7',
      },
      {
        name: 'testseason8',
        startTime: '2028-01-01',
        imageUrl: 'testurl8',
      },
      {
        name: 'testseason9',
        startTime: '2029-01-01',
        imageUrl: 'testurl9',
      },
      {
        name: 'testseason10',
        startTime: '2030-01-01',
        imageUrl: 'testurl10',
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
    await rankRepository.save([
      {
        user: users[0],
        season: seasons[0],
        rank: 10,
        record: 1100,
        bestRank: 1,
        bestRecord: 1111,
      },
      {
        user: users[0],
        season: seasons[1],
        rank: 20,
        record: 2200,
        bestRank: 2,
        bestRecord: 2222,
      },
      {
        user: users[0],
        season: seasons[2],
        rank: 3300,
        record: 3300,
        bestRank: 3,
        bestRecord: 3333,
      },
    ]);
    //Dto로 반환할때는 rank, bestRank만 반환하도록 수정해야함
    //const getDto1: GetRankDto = { userId: users[0].id, seasonId: seasons[0].id };// 시즌1데이터
    //const getDto2: GetRankDto = { userId: users[0].id, seasonId: seasons[1].id };// 시즌2데이터
    //const getDto3: GetRankDto = { userId: users[0].id, seasonId: seasons[2].id };// 시즌3데이터
    //const invalidgetDto1: GetRankDto = { userId: users[0].id, seasonId: seasons[3].id };// 없는시즌 데이터 BadRequest
    //const invalidgetDto2: GetRankDto = { userId: users[3].id, seasonId: seasons[0].id };// 없는 유저 데이터 BadRequest
    //const invalidgetDto3: GetRankDto = { userId: users[1].id, seasonId: seasons[0].id };// 시즌데이터가 없는 유저 데이터 NotFound

    //when
    const result1 = await service.getUserRankBySeason(getDto1);
    const result2 = await service.getUserRankBySeason(getDto2);
    const result3 = await service.getUserRankBySeason(getDto3);

    //then
    expect(result1).toEqual({
      rank: 10,
      record: 1100,
    });
    expect(result2).toEqual({
      rank: 20,
      record: 2200,
    });
    expect(result3).toEqual({
      rank: 3300,
      record: 3300,
    });
    await expect(service.getUserRankBySeason(invalidgetDto1)).rejects.toThrow(
      new BadRequestException(),
    );
    await expect(service.getUserRankBySeason(invalidgetDto2)).rejects.toThrow(
      new BadRequestException(),
    );
    await expect(service.getUserRankBySeason(invalidgetDto3)).rejects.toThrow(
      new NotFoundException(),
    );
  });

  it('유저 시즌 최고점 랭크데이터 반환', async () => {
    //given
    await rankRepository.save([
      {
        user: users[0],
        season: seasons[0],
        rank: 10,
        record: 1100,
        bestRank: 1,
        bestRecord: 1111,
      },
      {
        user: users[0],
        season: seasons[1],
        rank: 20,
        record: 2200,
        bestRank: 2,
        bestRecord: 2222,
      },
      {
        user: users[0],
        season: seasons[2],
        rank: 3300,
        record: 3300,
        bestRank: 3,
        bestRecord: 3333,
      },
    ]);

    //Dto로 반환할때는 bestRank, bestRecord만 반환하도록 수정해야함
    //const getDto1: GetRankDto = { userId: users[0].id, seasonId: seasons[0].id };// 시즌1데이터
    //const getDto2: GetRankDto = { userId: users[0].id, seasonId: seasons[1].id };// 시즌2데이터
    //const getDto3: GetRankDto = { userId: users[0].id, seasonId: seasons[2].id };// 시즌3데이터
    //const invalidgetDto1: GetRankDto = { userId: users[0].id, seasonId: seasons[3].id };// 없는시즌 데이터 BadRequest
    //const invalidgetDto2: GetRankDto = { userId: users[3].id, seasonId: seasons[0].id };// 없는 유저 데이터 BadRequest
    //const invalidgetDto3: GetRankDto = { userId: users[1].id, seasonId: seasons[0].id };// 시즌데이터가 없는 유저 데이터 NotFound

    //when
    const result1 = await service.getUserBestRankBySeason(getDto1);
    const result2 = await service.getUserBestRankBySeason(getDto2);
    const result3 = await service.getUserBestRankBySeason(getDto3);

    //then
    expect(result1).toEqual({
      bestRank: 1,
      bestRecord: 1111,
    });
    expect(result2).toEqual({
      bestRank: 2,
      bestRecord: 2222,
    });
    expect(result3).toEqual({
      bestRank: 3,
      bestRecord: 3333,
    });
    await expect(
      service.getUserBestRankBySeason(invalidgetDto1),
    ).rejects.toThrow(new BadRequestException());
    await expect(
      service.getUserBestRankBySeason(invalidgetDto2),
    ).rejects.toThrow(new BadRequestException());
    await expect(
      service.getUserBestRankBySeason(invalidgetDto3),
    ).rejects.toThrow(new NotFoundException());
  });
});
