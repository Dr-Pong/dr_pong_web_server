import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { TestService } from 'src/test/data/test.service';
import { initializeTransactionalContext } from 'typeorm-transactional';
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
    describe('/users/{nickname}/stats/total', () => {
      it('유저의 승률, 승, 무, 패 반환', async () => {
        const user = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/total',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('winRate');
        expect(response.body).toHaveProperty('wins');
        expect(response.body).toHaveProperty('ties');
        expect(response.body).toHaveProperty('loses');
      });

      it('유저의 승률, 1승, 2무, 3패 데이터 반환', async () => {
        await testService.createCustomResultUserBySeasons(1, 2, 3);
        const user = testService.users[0];
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/total',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(25);
        expect(response.body.wins).toBe(1);
        expect(response.body.ties).toBe(2);
        expect(response.body.loses).toBe(3);
      });

      it('유저의 승률, 0승, 0무, 0패 데이터 반환', async () => {
        await testService.createCustomResultUserBySeasons(0, 0, 0);
        const user = testService.users[0];
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/total',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(0);
        expect(response.body.wins).toBe(0);
        expect(response.body.ties).toBe(0);
        expect(response.body.loses).toBe(0);
      });

      it('뉴비라 경기기록이 없는 경우 유저 데이터 반환', async () => {
        const user = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/total',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(0);
        expect(response.body.wins).toBe(0);
        expect(response.body.ties).toBe(0);
        expect(response.body.loses).toBe(0);
      });

      it('과겨 시즌에 기록이 있으나 현재시즌 경기기록이 없는경우', async () => {
        await testService.createBasicSeasons(2);
        await testService.createPastSeasonGames();
        const user = testService.users[0];
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/total',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(100);
        expect(response.body.wins).toBe(3);
        expect(response.body.ties).toBe(0);
        expect(response.body.loses).toBe(0);
      });
    });

    describe('/users/{nickname}/stats/season', () => {
      it('유저의 승률, 승, 무, 패 반환', async () => {
        await testService.createBasicSeasons(1);
        const user = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/season',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('winRate');
        expect(response.body).toHaveProperty('wins');
        expect(response.body).toHaveProperty('ties');
        expect(response.body).toHaveProperty('loses');
      });

      it('유저의 승률, 1승, 2무, 3패 데이터 반환', async () => {
        await testService.createCustomResultUser(1, 2, 3);
        const user = testService.users[0];
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/season',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(25);
        expect(response.body.wins).toBe(1);
        expect(response.body.ties).toBe(2);
        expect(response.body.loses).toBe(3);
      });

      it('유저의 승률, 0승, 0무, 0패 데이터 반환', async () => {
        await testService.createBasicSeasons(1);
        await testService.createCustomResultUser(0, 0, 0);
        const user = testService.users[0];
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/season',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(0);
        expect(response.body.wins).toBe(0);
        expect(response.body.ties).toBe(0);
        expect(response.body.loses).toBe(0);
      });

      it('과겨 시즌에 기록이 있으나 현재시즌 경기기록이 없는경우', async () => {
        await testService.createBasicSeasons(2);
        await testService.createPastSeasonGames();
        const user = testService.users[0];
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/stats/season',
        );

        expect(response.statusCode).toBe(200);

        expect(response.body.winRate).toBe(0);
        expect(response.body.wins).toBe(0);
        expect(response.body.ties).toBe(0);
        expect(response.body.loses).toBe(0);
      });
    });

    describe('Error Cases Test', () => {
      it('GET /users/{nickname}/stat', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/stat',
        );
        expect(response.statusCode).toBe(404);
      });
    });
  });
});
