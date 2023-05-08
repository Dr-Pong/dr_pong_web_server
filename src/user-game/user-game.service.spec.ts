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

describe('UserGameService', () => {
  let service: UserGameService;
  let dataSources: DataSource;
  let testData: TestService;
  let UserGameRepository: Repository<UserGame>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeORMConfig),
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

    UserGameRepository = module.get<Repository<UserGame>>(
      getRepositoryToken(UserGame),
    );
    dataSources = module.get<DataSource>(DataSource);
    service = module.get<UserGameService>(UserGameService);
    testData = module.get<TestService>(TestService);

    await testData.createBasicSeasons(2);
    await testData.createBasicUsers();
    await testData.createBasicGames();
    await testData.createBasicUserGames();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저의 전체게임 데이터', async () => {
    const GetUserAllGameDto: GetUserGameTotalStatDto = {
      userId: testData.users[0].id,
    };
    const allGameRessult = await service.getUserAllGameStat(GetUserAllGameDto);

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

    const seasonGameResult = await service.getUserSeasonGameStat(
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
});
