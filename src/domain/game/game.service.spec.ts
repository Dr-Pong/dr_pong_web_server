import { TestService } from 'src/test/test.service';
import { GameService } from './game.service';
import { DataSource, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { GameModule } from './game.module';
import { TestModule } from 'src/test/test.module';
import { Game } from './game.entity';
import { PostGameDto } from './dto/post.game.dto';
import { GAMEMODE_SFINAE } from 'src/global/type/type.game.mode';
import { GAMETYPE_RANK } from 'src/global/type/type.game';
import {
  GAMEEVENT_SCORE,
  GAMEEVENT_TOUCH,
} from 'src/global/type/type.game.event';
import { UserGame } from '../user-game/user-game.entity';
import { TouchLog } from '../touch-log/touch.log.entity';
import { UserAchievement } from '../user-achievement/user-achievement.entity';
import { Rank } from '../rank/rank.entity';
import { RankRepository } from '../rank/rank.repository';

describe('GameService', () => {
  let service: GameService;
  let testData: TestService;
  let dataSources: DataSource;
  let gameRepository: Repository<Game>;
  let userGameRepository: Repository<UserGame>;
  let touchLogRepository: Repository<TouchLog>;
  let userAchievementRepository: Repository<UserAchievement>;

  beforeAll(async () => {
    initializeTransactionalContext();
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
        GameModule,
        TestModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(Game),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    testData = module.get<TestService>(TestService);
    dataSources = module.get<DataSource>(DataSource);
    gameRepository = module.get<Repository<Game>>(getRepositoryToken(Game));
    userGameRepository = module.get<Repository<UserGame>>(
      getRepositoryToken(UserGame),
    );
    touchLogRepository = module.get<Repository<TouchLog>>(
      getRepositoryToken(TouchLog),
    );
    userAchievementRepository = module.get<Repository<UserAchievement>>(
      getRepositoryToken(UserAchievement),
    );
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testData.createProfileImages();
    await testData.createBasicCollectable();
    await testData.createBasicSeasons(2);
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

  describe('postGame', () => {
    it('Game이 잘 저장되는지', async () => {
      await testData.createBasicUsers();
      await testData.createCurrentSeasonRank();
      const postDto: PostGameDto = {
        player1: {
          id: testData.users[0].id,
          score: 10,
          lpChange: 10,
        },
        player2: {
          id: testData.users[1].id,
          score: 10,
          lpChange: 10,
        },
        mode: GAMEMODE_SFINAE,
        type: GAMETYPE_RANK,
        startTime: new Date(),
        endTime: new Date(),
        logs: [],
      };

      for (let i = 1; i <= 10; i++) {
        const log = {
          userId: i,
          event: i % 2 === 0 ? GAMEEVENT_SCORE : GAMEEVENT_TOUCH,
          round: i,
          ball: {
            speed: 10,
            direction: { x: 10, y: 10 },
            position: { x: 10, y: 10 },
            spinSpeed: 10,
          },
        };

        postDto.logs.push(log);
      }

      await service.postGame(postDto);

      const game: Game = await gameRepository.findOne({
        where: { startTime: postDto.startTime },
      });
      expect(game.mode).toBe(postDto.mode);
      expect(game.type).toBe(postDto.type);
      expect(game.startTime.toString()).toStrictEqual(
        postDto.startTime.toString(),
      );
      expect(game.playTime).toBe(
        postDto.endTime.getTime() - postDto.startTime.getTime(),
      );
    });

    it('player가 2명 잘 저장 되는지', async () => {
      await testData.createBasicUsers();
      await testData.createCurrentSeasonRank();
      const postDto: PostGameDto = {
        player1: {
          id: testData.users[0].id,
          score: 10,
          lpChange: 10,
        },
        player2: {
          id: testData.users[1].id,
          score: 10,
          lpChange: 10,
        },
        mode: GAMEMODE_SFINAE,
        type: GAMETYPE_RANK,
        startTime: new Date(),
        endTime: new Date(),
        logs: [],
      };

      for (let i = 1; i <= 10; i++) {
        const log = {
          userId: i,
          event: i % 2 === 0 ? GAMEEVENT_SCORE : GAMEEVENT_TOUCH,
          round: i,
          ball: {
            speed: 10,
            direction: { x: 10, y: 10 },
            position: { x: 10, y: 10 },
            spinSpeed: 10,
          },
        };

        postDto.logs.push(log);
      }

      await service.postGame(postDto);

      const player1: UserGame = await userGameRepository.findOne({
        where: { user: { id: postDto.player1.id } },
      });
      const player2: UserGame = await userGameRepository.findOne({
        where: { user: { id: postDto.player2.id } },
      });

      expect(player1.id).toBe(postDto.player1.id);
      expect(player1.score).toBe(postDto.player1.score);
      expect(player1.lpChange).toBe(postDto.player1.lpChange);
      // expect(player1.lpResult).toBe(postDto.player1.lpChange);

      expect(player2.id).toBe(postDto.player2.id);
      expect(player2.score).toBe(postDto.player2.score);
      expect(player2.lpChange).toBe(postDto.player2.lpChange);
    });

    it('touchLog가 잘 저장되는지', async () => {
      await testData.createBasicUsers();
      await testData.createCurrentSeasonRank();

      const postDto: PostGameDto = {
        player1: {
          id: testData.users[0].id,
          score: 10,
          lpChange: 10,
        },
        player2: {
          id: testData.users[1].id,
          score: 10,
          lpChange: 10,
        },
        mode: GAMEMODE_SFINAE,
        type: GAMETYPE_RANK,
        startTime: new Date(),
        endTime: new Date(),
        logs: [],
      };

      for (let i = 1; i <= 10; i++) {
        const log = {
          userId: i % 2 === 0 ? postDto.player1.id : postDto.player2.id,
          event: i % 2 === 0 ? GAMEEVENT_SCORE : GAMEEVENT_TOUCH,
          round: i,
          ball: {
            speed: 10 + i,
            direction: { x: 10 + i, y: 10 + i },
            position: { x: 10 + i, y: 10 + i },
            spinSpeed: 10 + i,
          },
        };

        postDto.logs.push(log);
      }

      await service.postGame(postDto);

      const P1touchLogs: TouchLog[] = await touchLogRepository.find({
        where: { userGame: { user: { id: postDto.player1.id } } },
        order: { id: 'ASC' },
      });
      const P2touchLogs: TouchLog[] = await touchLogRepository.find({
        where: { userGame: { user: { id: postDto.player2.id } } },
        order: { id: 'ASC' },
      });

      expect(P1touchLogs.length).toBe(5);
      expect(P2touchLogs.length).toBe(5);

      for (let i = 0; i < P1touchLogs.length; i++) {
        expect(P1touchLogs[i].event).toBe(GAMEEVENT_SCORE);
        expect(P1touchLogs[i].round).toBe(2 + i * 2);
        expect(P1touchLogs[i].ballSpeed).toBe(12 + i * 2);
        expect(P1touchLogs[i].ballDirectionX).toBe(12 + i * 2);
        expect(P1touchLogs[i].ballDirectionY).toBe(12 + i * 2);
        expect(P1touchLogs[i].ballPositionX).toBe(12 + i * 2);
        expect(P1touchLogs[i].ballPositionY).toBe(12 + i * 2);
        expect(P1touchLogs[i].ballSpinSpeed).toBe(12 + i * 2);
      }
      for (let i = 0; i < P2touchLogs.length; i++) {
        expect(P2touchLogs[i].event).toBe(GAMEEVENT_TOUCH);
        expect(P2touchLogs[i].round).toBe(1 + i * 2);
        expect(P2touchLogs[i].ballSpeed).toBe(11 + i * 2);
        expect(P2touchLogs[i].ballDirectionX).toBe(11 + i * 2);
        expect(P2touchLogs[i].ballDirectionY).toBe(11 + i * 2);
        expect(P2touchLogs[i].ballPositionX).toBe(11 + i * 2);
        expect(P2touchLogs[i].ballPositionY).toBe(11 + i * 2);
        expect(P2touchLogs[i].ballSpinSpeed).toBe(11 + i * 2);
      }
    });

    it('player Achievement가 잘 저장되는지', async () => {
      await testData.createBasicCollectable();
      await testData.createBasicUsers();
      await testData.createCurrentSeasonRank();
      const postDto: PostGameDto = {
        player1: {
          id: testData.users[0].id,
          score: 10,
          lpChange: 1,
        },
        player2: {
          id: testData.users[1].id,
          score: 1,
          lpChange: 0,
        },
        mode: GAMEMODE_SFINAE,
        type: GAMETYPE_RANK,
        startTime: new Date(),
        endTime: new Date(),
        logs: [],
      };

      for (let i = 1; i <= 10; i++) {
        const log = {
          userId: i % 2 === 0 ? postDto.player1.id : postDto.player2.id,
          event: i % 2 === 0 ? GAMEEVENT_SCORE : GAMEEVENT_TOUCH,
          round: i,
          ball: {
            speed: 10 + i,
            direction: { x: 10 + i, y: 10 + i },
            position: { x: 10 + i, y: 10 + i },
            spinSpeed: 10 + i,
          },
        };

        postDto.logs.push(log);
      }

      const postDto2: PostGameDto = {
        player1: {
          id: testData.users[0].id,
          score: 10,
          lpChange: 99,
        },
        player2: {
          id: testData.users[1].id,
          score: 1,
          lpChange: 0,
        },
        mode: GAMEMODE_SFINAE,
        type: GAMETYPE_RANK,
        startTime: new Date(),
        endTime: new Date(),
        logs: [],
      };

      for (let i = 1; i <= 10; i++) {
        const log = {
          userId: i % 2 === 0 ? postDto2.player1.id : postDto2.player2.id,
          event: i % 2 === 0 ? GAMEEVENT_SCORE : GAMEEVENT_TOUCH,
          round: i,
          ball: {
            speed: 10 + i,
            direction: { x: 10 + i, y: 10 + i },
            position: { x: 10 + i, y: 10 + i },
            spinSpeed: 10 + i,
          },
        };

        postDto2.logs.push(log);
      }

      await service.postGame(postDto);
      await service.postGame(postDto2);

      const P1userAchievements: UserAchievement[] =
        await userAchievementRepository.find({
          where: { user: { id: postDto.player1.id } },
        });

      const P2userAchievements: UserAchievement[] =
        await userAchievementRepository.find({
          where: { user: { id: postDto.player2.id } },
          order: { id: 'ASC' },
        });

      // user 1 achievement 2개 (1번째는 게임승리, 2번째는 닥터 달성) 생성시에 닥터로 생성함
      expect(P1userAchievements.length).toBe(2);

      // user 2 achievement 1개 (1번째 닥터달성) 생성시에 닥터로 생성함
      expect(P2userAchievements.length).toBe(1);
    });
  });
});
