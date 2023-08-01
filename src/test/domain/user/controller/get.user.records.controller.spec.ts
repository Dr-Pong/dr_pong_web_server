import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { TestService } from 'src/test/data/test.service';
import { initializeTransactionalContext } from 'typeorm-transactional';
import {
  GAMERESULT_LOSE,
  GAMERESULT_TIE,
  GAMERESULT_WIN,
} from 'src/global/type/type.game.result';
import { UserService } from 'src/domain/user/user.service';

describe('UserController', () => {
  let app: INestApplication;
  let dataSources: DataSource;
  let testService: TestService;
  let userService: UserService;
  initializeTransactionalContext();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = moduleFixture.get<TestService>(TestService);
    userService = moduleFixture.get<UserService>(UserService);
    dataSources = moduleFixture.get<DataSource>(DataSource);
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testService.createProfileImages();
    await testService.createBasicCollectable();
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
    await app.close();
  });

  afterEach(async () => {
    testService.clear();
    userService.users.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  afterEach(async () => {
    testService.clear();
    userService.users.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  describe('GET tests', () => {
    describe('/users/{nickname}/records?count={count}&lastGameId={lastGameId}', () => {
      it('count 가 없는 경우 디폴트 작동확인', async () => {
        await testService.createCustomResultUser(1, 2, 3);
        const lastGameId = 4242;
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.users[0].nickname +
            '/records?lastGameId=' +
            lastGameId,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.records[0].result).toBe(GAMERESULT_WIN);
        expect(response.body.records[1].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[2].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[3].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[4].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[5].result).toBe(GAMERESULT_LOSE);
      });

      it('lastGameId 가 없는 경우 디폴트 작동확인', async () => {
        const count = 11;
        await testService.createCustomResultUser(1, 2, 3);
        const response = await request(app.getHttpServer()).get(
          '/users/' + testService.users[0].nickname + '/records?count=' + count,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.records[0].result).toBe(GAMERESULT_WIN);
        expect(response.body.records[1].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[2].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[3].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[4].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[5].result).toBe(GAMERESULT_LOSE);
      });

      it('count 가 진행 게임보다 적은경우', async () => {
        const lastGameId = 4242;
        const count = 11;
        await testService.createCustomResultUser(1, 2, 300);
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.users[0].nickname +
            '/records?count=' +
            count +
            '&lastGameId=' +
            lastGameId,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.records.length).toBe(count);
        expect(response.body.records[0].result).toBe(GAMERESULT_WIN);
        expect(response.body.records[1].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[2].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[3].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[4].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[5].result).toBe(GAMERESULT_LOSE);
      });

      it('count 가 진행 게임보다 많은경우', async () => {
        const lastGameId = 4242;
        const count = 111;
        await testService.createCustomResultUser(1, 2, 108);
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.users[0].nickname +
            '/records?count=' +
            count +
            '&lastGameId=' +
            lastGameId,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.records.length).toBe(count);
        expect(response.body.records[0].result).toBe(GAMERESULT_WIN);
        expect(response.body.records[1].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[2].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[3].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[4].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[5].result).toBe(GAMERESULT_LOSE);
      });

      it('lastGameId 가  진행 게임보다 많은경우', async () => {
        const lastGameId = 10;
        const count = 10;
        await testService.createCustomResultUser(1, 2, 3);
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.users[0].nickname +
            '/records?count=' +
            count +
            '&lastGameId=' +
            lastGameId,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.isLastPage).toBe(true);
        expect(response.body.records[0].result).toBe(GAMERESULT_WIN);
        expect(response.body.records[1].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[2].result).toBe(GAMERESULT_TIE);
        expect(response.body.records[3].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[4].result).toBe(GAMERESULT_LOSE);
        expect(response.body.records[5].result).toBe(GAMERESULT_LOSE);
      });

      it('lastGameId 가  진행 게임보다 적은경우 ', async () => {
        const lastGameId = 3;
        const count = 10;
        await testService.createCustomResultUser(1, 1, 0);
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.users[0].nickname +
            '/records?count=' +
            count +
            '&lastGameId=' +
            lastGameId,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.isLastPage).toBe(true);
        expect(response.body.records[0].result).toBe(GAMERESULT_WIN);
        expect(response.body.records[1].result).toBe(GAMERESULT_TIE);
      });
    });

    describe('Error Cases Test', () => {
      it('GET /users/{nickname}/records?count={count}&lastGameId={lastGameId} ', async () => {
        const count = 10;
        const lastGameId = 4242;
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            'nononon' +
            '/records?count=' +
            count +
            '/lastGameId=' +
            lastGameId,
        );

        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/records/{gameId}', () => {
      it('유저의 게임 기록 반환', async () => {
        const userGame = await testService.createGameWithTouchLog(10);
        const response = await request(app.getHttpServer()).get(
          '/users/' + userGame.user.nickname + '/records/' + userGame.game.id,
        );
        expect(response.statusCode).toBe(200);
        //인자 있는지 확인
        expect(response.body).toHaveProperty('duration');
        expect(response.body).toHaveProperty('me');
        expect(response.body).toHaveProperty('you');
        expect(response.body).toHaveProperty('rounds');
        // 값 확인
        expect(response.body.duration).toBe(10);
        expect(response.body.me.lp).toBe(110);
        expect(response.body.me.lpChange).toBe(10);
        expect(response.body.you.lp).toBe(90);
        expect(response.body.you.lpChange).toBe(-10);
      });
      it('Error Cases Test: UserGame에 유저가 없는경우', async () => {
        await testService.createBasicGames();
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            'user00000' +
            '/records/' +
            testService.userGames[0].game.id,
        );
        expect(response.statusCode).toBe(404);
      });
      it('Error Cases Test: 찾는 gameId 가 없는경우', async () => {
        await testService.createBasicGames();
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.userGames[0].user.nickname +
            '/records/' +
            100,
        );
        expect(response.statusCode).toBe(404);
      });
    });

    describe('/users/{nickname}/records/{gameId}/exp', () => {
      it('유저의 게임 경험치 반환', async () => {
        const userGame = await testService.createGameWithTouchLog(10);
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            userGame.user.nickname +
            '/records/' +
            userGame.game.id +
            '/exp',
        );
        expect(response.statusCode).toBe(200);
        //인자 있는지 확인
        expect(response.body).toHaveProperty('beforeExp');
        expect(response.body).toHaveProperty('expChange');
        expect(response.body).toHaveProperty('levelExp');

        // 값 확인
        expect(response.body.expChange).toBe(Number(process.env.GAME_WIN_EXP));
        expect(response.body.levelExp).toBe(Number(process.env.LEVEL_UP_EXP));
      });
      it('Error Cases Test: UserGame에 유저가 없는경우', async () => {
        const userGame = await testService.createGameWithTouchLog(10);
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'user00000' + '/records/' + userGame.game.id + '/exp',
        );
        expect(response.statusCode).toBe(404);
      });
      it('Error Cases Test: 찾는 gameId 가 없는경우', async () => {
        await testService.createBasicGames();
        const response = await request(app.getHttpServer()).get(
          '/users/' +
            testService.userGames[0].user.nickname +
            '/records/' +
            100 +
            '/exp',
        );
        expect(response.statusCode).toBe(404);
      });
    });
  });
});
