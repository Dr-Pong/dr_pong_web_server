import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Title } from 'src/title/title.entity';
import { TestService } from 'src/test/test.service';

describe('UserController', () => {
  let controller: UserController;
  let app: INestApplication;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let dataSources: DataSource;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = moduleFixture.get<TestService>(TestService);
    dataSources = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
    await app.close();
  });

  describe('GET tests', () => {
    it('GET /users/me', async () => {
      // const response = (await request(app.getHttpServer()).get('/users/me')).header(
      //   // jwt token init
      // );
      // console.log(response.body);
      // console.log(response.statusCode);
      // expect(response.statusCode).toBe(200);
    });

    it('GET /users/{nickname}/detail', async () => {
      const user: User = await testService.createBasicUser();
      // console.log('user', user);
      const response = await request(app.getHttpServer()).get(
        '/users/' + user.nickname + '/detail',
      );

      // console.log('body', response.body);
      // console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body.nickname).toBe(user.nickname); //원하는 데이터 넣기
      expect(response.body.imgUrl).toBe(user.imageUrl); //원하는 데이터 넣기
      expect(response.body.statusMessage).toBe(user.statusMessage); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/stat', async () => {
      // const user: User = await testService.createBasicUser();
      // await testService.createBasicSeasons(3);
      // await testService.createBasicRank();
      // const response = await request(app.getHttpServer()).get(
      //   '/users/' + user.nickname + '/stat',
      // );
      // console.log(response.body);
      // console.log(response.statusCode);
      // expect(response.statusCode).toBe(200);
      // expect(response.body).toHaveProperty('totalStat'); //원하는 데이터 넣기
      // expect(response.body).toHaveProperty('seasonStat'); //원하는 데이터 넣기
      // expect(response.body).toHaveProperty('bestStat'); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/achievements?selected={true}', async () => {
      await testService.createBasicCollectable();
      const user: User = await testService.createUserWithCollectables();
      const response = await request(app.getHttpServer()).get(
        '/users/' + user.nickname + '/achievements?selected={true}',
      );
      console.log(response.body);
      console.log(response.statusCode);
      console.log(response.body.achievements.length);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('achievements'); //원하는 데이터 넣기
      expect(response.body.achievements.length).toBe(3); //원하는 데이터 넣기
      expect(response.body.achievements[0]).toHaveProperty('id'); //원하는 데이터 넣기
      expect(response.body.achievements[0]).toHaveProperty('name'); //원하는 데이터 넣기
      expect(response.body.achievements[0]).toHaveProperty('imgUrl'); //원하는 데이터 넣기
      expect(response.body.achievements[0]).toHaveProperty('content'); //원하는 데이터 넣기
      expect(response.body.achievements[0]).toHaveProperty('status'); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/achievements?selected={false}', async () => {
      // await testService.createBasicCollectable();
      // const user: User = await testService.createUserWithCollectables();
      // const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/achievements?selected={false}');
      // console.log(response.body);
      // console.log(response.statusCode);
      // expect(response.statusCode).toBe(200);
      // expect(response.body).toHaveProperty('achievements'); //원하는 데이터 넣기
      // expect(response.body.achievements.length).toBe(testService.achievements.length); //원하는 데이터 넣기
      // expect(response.body.achievements[0]).toHaveProperty('id'); //원하는 데이터 넣기
      // expect(response.body.achievements[0]).toHaveProperty('name'); //원하는 데이터 넣기
      // expect(response.body.achievements[0]).toHaveProperty('imgUrl'); //원하는 데이터 넣기
      // expect(response.body.achievements[0]).toHaveProperty('content'); //원하는 데이터 넣기
      // expect(response.body.achievements[0]).toHaveProperty('status'); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/emojis?selected={true}', async () => {
      // await testService.createBasicCollectable();
      // const user: User = await testService.createUserWithCollectables();
      // const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/emojis?selected={true}');
      // console.log(response.body);
      // console.log(response.statusCode);
      // expect(response.statusCode).toBe(200);
      // expect(response.body).toHaveProperty('emojis'); //원하는 데이터 넣기
      // expect(response.body.emojis.length).toBe(4); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('id'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('name'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('imgUrl'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('content'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('status'); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/emojis?selected={false}', async () => {
      // await testService.createBasicCollectable();
      // const user: User = await testService.createUserWithCollectables();
      // const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/emojis?selected={false}');
      // console.log(response.body);
      // console.log(response.statusCode);
      // expect(response.statusCode).toBe(200);
      // expect(response.body).toHaveProperty('emojis'); //원하는 데이터 넣기
      // expect(response.body.emojis.length).toBe(testService.emojis.length); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('id'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('name'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('imgUrl'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('content'); //원하는 데이터 넣기
      // expect(response.body.emojis[0]).toHaveProperty('status'); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/titles', async () => {
      await testService.createBasicCollectable();
      const user: User = await testService.createUserWithCollectables();
      const response = await request(app.getHttpServer()).get(
        '/users/' + user.nickname + '/titles',
      );

      // console.log(response.body);
      // console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('titles'); //원하는 데이터 넣기
      expect(response.body.titles).toHaveProperty('titles[]'); //원하는 데이터 넣기
    });
  });

  describe('patch cases', () => {
    it('PATCH /users/{nickname}/detail', async () => {
      // const user: User = await testService.createBasicUser();
      // const response = await request(app.getHttpServer())
      //   .patch('/users/' + user.nickname + '/detail')
      //   .send({ imgUrl: 'changed', titleId: null, message: 'change message' });
      // console.log(response.statusCode);
      // expect(response.statusCode).toBe(200);
    });

    it('PATCH /users/{nickname}/achievements', async () => {
      await testService.createBasicCollectable();
      const user: User =
        await testService.createUserWithUnSelectedAchievements();
      const response = await request(app.getHttpServer())
        .patch('/users/' + user.nickname + '/achievements')
        .send({
          achievements: [
            testService.achievements[0].id,
            testService.achievements[1].id,
            testService.achievements[2].id,
          ],
        });

      // console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
    });

    it('PATCH /users/{nickname}/emojis', async () => {
      await testService.createBasicCollectable();
      const user: User = await testService.createUserWithUnSelectedEmojis();
      const response = await request(app.getHttpServer())
        .patch('/users/' + user.nickname + '/emojis')
        .send({
          emojis: [
            testService.emojis[0].id,
            testService.emojis[1].id,
            testService.emojis[2].id,
            testService.emojis[3].id,
          ],
        });

      // console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('error cases', () => {
    it('GET /users/', async () => {});
  });
});
