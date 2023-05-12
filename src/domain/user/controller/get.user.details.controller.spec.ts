import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { TestService } from 'src/test/test.service';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UserService } from '../user.service';
import { User } from '../user.entity';

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
    describe('/users/{nickname}/detil', () => {
      it('타이틀이 없는 경우', async () => {
        const user: User = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/detail',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.nickname).toBe(user.nickname); //원하는 데이터 넣기
        expect(response.body.imgUrl).toBe(user.image.url); //원하는 데이터 넣기
        expect(response.body.statusMessage).toBe(user.statusMessage); //원하는 데이터 넣기
      });

      it('타이틀을 선택 한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/detail',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.nickname).toBe(user.nickname); //원하는 데이터 넣기
        expect(response.body.imgUrl).toBe(user.image.url); //원하는 데이터 넣기
        expect(response.body.statusMessage).toBe(user.statusMessage); //원하는 데이터 넣기
        expect(response.body).toHaveProperty('title.id'); //원하는 데이터 넣기
        expect(response.body).toHaveProperty('title.title'); //원하는 데이터 넣기
      });

      it('타이틀을 있는데 "안"선택한 경우', async () => {
        const user: User = await testService.createUserWithUnSelectedTitles();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/detail',
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.nickname).toBe(user.nickname); //원하는 데이터 넣기
        expect(response.body.imgUrl).toBe(user.image.url); //원하는 데이터 넣기
        expect(response.body.statusMessage).toBe(user.statusMessage); //원하는 데이터 넣기
        expect(response.body.title).toBe(null); //원하는 데이터 넣기
      });
    });
    describe('Error Cases Test', () => {
      it('GET /users/{nickname}/detail', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/detail',
        );
        expect(response.statusCode).toBe(404);
      });
    });
  });
});
