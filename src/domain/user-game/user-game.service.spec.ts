import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { UserGame } from './user-game.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TestModule } from 'src/test/test.module';
import { TestService } from 'src/test/test.service';
import { GetUserGameTotalStatDto } from './dto/get.user-game.total.stat.dto';
import { UserGameModule } from './user-game.module';
import { UserGameService } from './user-game.service';
import { GetUserGameSeasonStatDto } from './dto/get.user-game.season.stat.dto';
import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
} from 'src/global/type/type.game.result';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { User } from 'src/domain/user/user.entity';
import { UserGameRecordsDto } from './dto/user-game.records.dto';
import { GetUserGameRecordsDto } from './dto/get.user-game.records.dto';
import { GetUserGameByNicknameAndGameIdDto } from './dto/get.user-game.by.nickname.and.gameid.dto';
import { UserGameByNicknameAndGameIdResponseDto } from './dto/get.user-game.game.response.dto';

describe('UserGameService', () => {
  let service: UserGameService;
  let testData: TestService;
  let UserGameRepository: Repository<UserGame>;
  let dataSources: DataSource;

  initializeTransactionalContext();
  beforeAll(async () => {
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
        UserGameModule,
        TestModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(UserGame),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserGameService>(UserGameService);
    testData = module.get<TestService>(TestService);
    UserGameRepository = module.get<Repository<UserGame>>(
      getRepositoryToken(UserGame),
    );
    dataSources = module.get<DataSource>(DataSource);
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testData.createProfileImages();
    await testData.createBasicCollectable();
    await testData.createCurrentSeasonRank();
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

  it('유저의 전체게임 데이터', async () => {
    await testData.createBasicGames();
    const getUserAllGameDto: GetUserGameTotalStatDto = {
      userId: testData.users[0].id,
    };
    const allGameResult = await service.getUserGameTotalStat(getUserAllGameDto);

    const userGameInDb: UserGame[] = await UserGameRepository.find({
      where: { user: { id: testData.users[0].id } },
    });

    const testWin = userGameInDb.filter(
      (userGame) => userGame.result === GAMERESULT_WIN,
    ).length;
    const testLose = userGameInDb.filter(
      (userGame) => userGame.result === GAMERESULT_LOSE,
    ).length;
    const testTies = userGameInDb.filter(
      (userGame) => userGame.result === GAMERESULT_TIE,
    ).length;

    const testWinRate = (testWin / (testWin + testLose)) * 100;

    expect(allGameResult.winRate).toBe(testWinRate);
    expect(allGameResult.wins).toBe(testWin);
    expect(allGameResult.ties).toBe(testTies);
    expect(allGameResult.loses).toBe(testLose);
  });

  it('유저의 현시즌 게임 데이터', async () => {
    await testData.createBasicGames();
    const GetUserSeasonGameDto: GetUserGameSeasonStatDto = {
      userId: testData.users[0].id,
    };
    const currentSeason = testData.currentSeason;

    const seasonGameResult = await service.getUserGameSeasonStat(
      GetUserSeasonGameDto,
    );

    const userGameInDb: UserGame[] = await UserGameRepository.find({
      where: {
        user: { id: testData.users[0].id },
        game: { season: { id: currentSeason.id } },
      },
    });

    const seasonWin = userGameInDb.filter(
      (userGame) => userGame.result === GAMERESULT_WIN,
    ).length;
    const seasonLose = userGameInDb.filter(
      (userGame) => userGame.result === GAMERESULT_LOSE,
    ).length;
    const seasonTies = userGameInDb.filter(
      (userGame) => userGame.result === GAMERESULT_TIE,
    ).length;

    const seasonWinRate = (seasonWin / (seasonWin + seasonLose)) * 100;

    expect(seasonGameResult.winRate).toBe(seasonWinRate);
    expect(seasonGameResult.wins).toBe(seasonWin);
    expect(seasonGameResult.ties).toBe(seasonTies);
    expect(seasonGameResult.loses).toBe(seasonLose);
  });

  it('count 별 유저의 게임 전적 목록 조회', async () => {
    await testData.createProfileImages();
    await testData.createMixedTypeGames(15);

    const countLowerThanGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: 2147483647,
    };

    const countEqualGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 15,
      lastGameId: 2147483647,
    };

    const countLargerThanGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 20,
      lastGameId: 2147483647,
    };

    const countLowerThanGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(
        countLowerThanGamesRequest,
      );
    const countEqualGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(
        countEqualGamesRequest,
      );
    const countLargerThanGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(
        countLargerThanGamesRequest,
      );

    expect(countLowerThanGames.records.length).toBe(10);
    expect(countLowerThanGames.records[0].me.nickname).toBe(
      testData.users[0].nickname,
    );
    expect(countLowerThanGames.records[0].you.nickname).toBe(
      testData.users[1].nickname,
    );
    expect(countLowerThanGames.isLastPage).toBe(false);

    expect(countEqualGames.records.length).toBe(testData.games.length);
    expect(countEqualGames.records[0].me.nickname).toBe(
      testData.users[0].nickname,
    );
    expect(countEqualGames.records[0].you.nickname).toBe(
      testData.users[1].nickname,
    );
    expect(countEqualGames.isLastPage).toBe(true);

    expect(countLargerThanGames.records.length).toBe(testData.games.length);
    expect(countLargerThanGames.records[0].me.nickname).toBe(
      testData.users[0].nickname,
    );
    expect(countLargerThanGames.records[0].you.nickname).toBe(
      testData.users[1].nickname,
    );
    expect(countLargerThanGames.isLastPage).toBe(true);
  });

  it('lastGameId 별 유저의 게임 전적 목록 조회', async () => {
    await testData.createMixedTypeGames(15);

    const allGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: 2147483647,
    };

    const splitedGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: testData.games[4].id,
    };

    const noGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: testData.games[0].id,
    };

    const allGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(allGamesRequest);
    const splitedGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(splitedGamesRequest);
    const noGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(noGamesRequest);

    expect(allGames.records.length).toBe(10);
    expect(allGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(allGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(allGames.isLastPage).toBe(false);

    expect(splitedGames.records.length).toBe(4);
    expect(splitedGames.records[0].me.nickname).toBe(
      testData.users[0].nickname,
    );
    expect(splitedGames.records[0].you.nickname).toBe(
      testData.users[1].nickname,
    );
    expect(splitedGames.isLastPage).toBe(true);

    expect(noGames.records.length).toBe(0);
    expect(noGames.isLastPage).toBe(true);
  });

  it('경기 기록이 없는 유저의 게임 전적 목록', async () => {
    const noGameUser: User = await testData.createBasicUser();

    const noGamesRequest: GetUserGameRecordsDto = {
      userId: noGameUser.id,
      count: 10,
      lastGameId: 2147483647,
    };

    const noGames: UserGameRecordsDto =
      await service.getUserGameRecordsByCountAndLastGameId(noGamesRequest);

    expect(noGames.records.length).toBe(0);
    expect(noGames.isLastPage).toBe(true);
  });

  it('nickname 이 가지고있는 gameId 로 정보조회', async () => {
    await testData.createBasicGames();

    const user0GameDto = new GetUserGameByNicknameAndGameIdDto(
      testData.users[0].nickname,
      testData.games[0].id,
    );
    const UserGameResponseDto: UserGameByNicknameAndGameIdResponseDto =
      await service.getUserGameByNicknameAndGameId(user0GameDto);
    expect(UserGameResponseDto.duration).toBe(10);
    expect(UserGameResponseDto.me.lp).toBe(100);
    expect(UserGameResponseDto.me.lpChange).toBe(0);
    expect(UserGameResponseDto.you.lp).toBe(100);
    expect(UserGameResponseDto.you.lpChange).toBe(0);
    expect(UserGameResponseDto).toHaveProperty('rounds');
    // expect(UserGameResponseDto.rounds[0].bounces).toHaveProperty('bounces');
    // expect(UserGameResponseDto.rounds[0].meWin).toHaveProperty('meWin');
  });
});
