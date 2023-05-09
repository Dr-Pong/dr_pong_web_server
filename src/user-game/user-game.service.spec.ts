import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { UserGame } from './user-game.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TestModule } from 'src/test/test.module';
import { TestService } from 'src/test/test.service';
import { GetUserGameTotalStatDto } from './dto/get.user.game.total.stat.dto';
import { UserGameModule } from './user-game.module';
import { UserGameService } from './user-game.service';
import { GetUserGameSeasonStatDto } from './dto/get.user.game.season.stat.dto';
import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
} from 'src/global/type/type.game.result';
import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { User } from 'src/user/user.entity';

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
    const GetUserAllGameDto: GetUserGameTotalStatDto = {
      userId: testData.users[0].id,
    };
    const allGameRessult = await service.getUserGameTotalStat(GetUserAllGameDto);

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

    const testWinRate = testWin / (testWin + testLose);

    expect(allGameRessult.length).toBe(6);
    expect(allGameRessult[0].winRate).toBe(testWinRate);
    expect(allGameRessult[0].win).toBe(testWin);
    expect(allGameRessult[0].ties).toBe(testTies);
    expect(allGameRessult[0].lose).toBe(testLose);
  });

  it('유저의 현시즌 게임 데이터', async () => {
    const GetUserSeasonGameDto: GetUserGameSeasonStatDto = {
      userId: testData.users[0].id,
      seasonId: testData.seasons[0].id,
    };
    const currentSeason = testData.seasons[0];

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

    const seasonWinRate = seasonWin / (seasonWin + seasonLose);

    expect(seasonGameResult.length).toBe(3);

    expect(seasonGameResult[0].winRate).toBe(seasonWinRate);
    expect(seasonGameResult[0].win).toBe(seasonWin);
    expect(seasonGameResult[0].ties).toBe(seasonTies);
    expect(seasonGameResult[0].lose).toBe(seasonLose);
  });

  it('count 별 유저의 게임 전적 목록 조회', async () => {
    await testData.createMixedTypeGames(15);

    const countLowerThanGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: 0,
    }

    const countEqualGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 15,
      lastGameId: 0,
    }

    const countLargerThanGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 20,
      lastGameId: 0,
    }

    const countLowerThanGames: UserGameRecoredsDto = service.getUserGameRecordsByCountAndLastGameId(countLowerThanGamesRequest);
    const countEqualGames: UserGameRecoredsDto = service.getUserGameRecordsByCountAndLastGameId(countEqualGamesRequest);
    const countLargerThanGames: UserGameRecoredsDto = service.getUserGameRecordsByCountAndLastGameId(countLargerThanGamesRequest);

    expect(countLowerThanGames.records.length).toBe(10);
    expect(countLowerThanGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(countLowerThanGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(countLowerThanGames.isLastPage).toBe(false);

    expect(countEqualGames.records.length).toBe(testData.games.length);
    expect(countEqualGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(countEqualGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(countEqualGames.isLastPage).toBe(true);

    expect(countLargerThanGames.records.length).toBe(testData.games.length);
    expect(countLargerThanGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(countLargerThanGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(countLargerThanGames.isLastPage).toBe(true);
  });

  it('lastGameId 별 유저의 게임 전적 목록 조회', async () => {
    await testData.createMixedTypeGames(15);

    const allGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: 0,
    }

    const splitedGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: testData.games[4].id,
    }

    const noGamesRequest: GetUserGameRecordsDto = {
      userId: testData.users[0].id,
      count: 10,
      lastGameId: testData.games[0].id,
    }

    const allGames: UserGameRecoredsDto = service.getUserGameRecordsByCountAndLastGameId(allGamesRequest);
    const splitedGames: UserGameRecoredsDto = service.getUserGameRecordsByCountAndLastGameId(splitedGamesRequest);
    const noGames: UserGameRecoredsDto = service.getUserGameRecordsByCountAndLastGameId(noGamesRequest);

    expect(allGames.records.length).toBe(10);
    expect(allGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(allGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(allGames.isLastPage).toBe(false);

    expect(splitedGames.records.length).toBe(testData.games.length);
    expect(splitedGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(splitedGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(splitedGames.isLastPage).toBe(true);

    expect(noGames.records.length).toBe(testData.games.length);
    expect(noGames.records[0].me.nickname).toBe(testData.users[0].nickname);
    expect(noGames.records[0].you.nickname).toBe(testData.users[1].nickname);
    expect(noGames.isLastPage).toBe(true);
  });

  it('경기 기록이 없는 유저의 게임 전적 목록', async () => {
    const noGameUser: User = await testData.createBasicUser();

    const noGamesRequest: GetUserGameRecordsDto = {
      userId: noGameUser.id,
      count: 10,
      lastGameId: 0,
    }

    const noGames: UserGameRecoredsDto = await service.getUserGameRecordsByCountAndLastGameId(noGamesRequest);

    expect(noGames.records.length).toBe(0);
    expect(noGames.isLastPage).toBe(true);
  })
});
