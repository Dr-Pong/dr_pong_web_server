import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { TestService } from 'src/test/data/test.service';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UserService } from 'src/domain/user/user.service';
import { User } from 'src/domain/user/user.entity';

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
    describe('/users/{nickname}/ranks/season', () => {
      it('유저 현시즌 record rank tier반환', async () => {
        const user: User = await testService.createBasicUser();
        await testService.createBasicSeasons(1);
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/ranks/season',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('rank');
        expect(response.body).toHaveProperty('tier');
        expect(response.body).toHaveProperty('bestLp');
      });
    });

    describe('/users/{nickname}/ranks/total', () => {
      it('역대 최고 랭크 요청', async () => {
        const user: User = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/ranks/total',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('rank');
        expect(response.body).toHaveProperty('tier');
        expect(response.body).toHaveProperty('bestLp');
      });
    });

    describe('Error Cases Test', () => {
      it('GET /users/{nickname}/ranks/season ', async () => {
        await testService.createBasicSeasons(1);
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'nononon ' + '/ranks/season',
        );

        expect(response.body).toStrictEqual({
          bestLp: null,
          rank: null,
          tier: 'egg',
        });
        expect(response.statusCode).toBe(200);
      });
    });
  });
});
