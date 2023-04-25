import { Test, TestingModule } from '@nestjs/testing';
import { UserGameService } from './user-game.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { UserGame } from './user-game.entity';
import { Game } from 'src/game/game.entity';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Season } from 'src/season/season.entity';
import { GetUserGameStatDto } from './dto/get.user.game.stat.dot';
import { UserGameStatDto } from './dto/user.game.stat.dto';

//밥묵고와서 테스트 파일 만들기
describe('UserGameService', () => {
  let service: UserGameService;
  let dataSources: DataSource;
  let userRepository: Repository<User>;
  let userGameRepository: Repository<UserGame>;
  let gameRepository: Repository<Game>;
  let seasonRepository: Repository<Season>;
  let users: User[];
  let games: Game[];
  let seasons: Season[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        UserGameService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserGame),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Game),
          useClass: Repository,
        },
      ],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userGameRepository = module.get<Repository<UserGame>>(
      getRepositoryToken(UserGame),
    );
    gameRepository = module.get<Repository<Game>>(getRepositoryToken(Game));
    dataSources = module.get<DataSource>(DataSource);
    service = module.get<UserGameService>(UserGameService);

    //유저 3명생성
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
      {
        nickname: 'testnick4',
        email: 'testemail4',
        imageUrl: 'testurl4',
        level: 4,
        statusMessage: 'testmessage4',
      },
    ]);
    //시즌 2개
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
    ]);
    //game 3개 생성
    games = await gameRepository.save([
      {
        season: seasons[0],
        startTime: '2021-01-01T01:00:00+09:00',
        playTime: 100,
        type: 1,
      },
      {
        season: seasons[0],
        startTime: '2021-02-02T01:00:00+09:00',
        playTime: 100,
        type: 1,
      },
      {
        season: seasons[1],
        startTime: '2022-02-02T02:00:00+09:00',
        playTime: 200,
        type: 2,
      },
    ]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저의 게임 데이터 반환', async () => {
    //given
    //userGame 5개 생성
    const savedUserGames = await userGameRepository.save([
      //user[0]의 게임 3개
      {
        user: users[0],
        game: games[0],
        score: 3,
        lpChange: 100,
        lpResult: 100,
      },
      {
        user: users[0],
        game: games[1],
        score: 2,
        lpChange: -100,
        lpResult: 0,
      },
      {
        user: users[0],
        game: games[2],
        score: 2,
        lpChange: 600,
        lpResult: 600,
      },
      //user[1]의 게임 2개
      {
        user: users[1],
        game: games[0],
        score: 1,
        lpChange: -300,
        lpResult: -300,
      },
      {
        user: users[1],
        game: games[1],
        score: 4,
        lpChange: 400,
        lpResult: 100,
      },
      //user[2]의 게임 1개
      {
        user: users[2],
        game: games[2],
        score: 5,
        lpChange: -500,
        lpResult: -500,
      },
    ]);

    const getDto1: GetUserGameStatDto = {
      userId: users[0].id,
    };
    const getDto2: GetUserGameStatDto = {
      userId: users[1].id,
    };
    const getDto3: GetUserGameStatDto = {
      userId: users[2].id,
    };
    //user[3] 은 게임 데이터가 없음
    const getDto4: GetUserGameStatDto = {
      userId: users[3].id,
    };

    //when
    const result1 = await service.getUserGameStat(getDto1);
    const result2 = await service.getUserGameStat(getDto2);
    const result3 = await service.getUserGameStat(getDto3);
    const result4 = await service.getUserGameStat(getDto4);

    //then

    //게임 유저 테이블에 유저의 승, 무, 패 데이터가 있는 경우
    expect(result1.winRate).toBe(66.67);
    expect(result1.win).toBe(2);
    expect(result1.lose).toBe(1);
    expect(result1.ties).toBe(0);

    expect(result2.winRate).toBe(50);
    expect(result2.win).toBe(1);
    expect(result2.lose).toBe(1);
    expect(result2.ties).toBe(0);

    expect(result3.winRate).toBe(0);
    expect(result3.win).toBe(0);
    expect(result3.lose).toBe(1);
    expect(result3.ties).toBe(0);

    //게임 유저 테이블에 유저의 승, 무, 패 데이터가 없는 경우 user[3]
    expect(result4.winRate).toBe(0);
    expect(result4.win).toBe(0);
    expect(result4.lose).toBe(0);
    expect(result4.ties).toBe(0);
  });
});
