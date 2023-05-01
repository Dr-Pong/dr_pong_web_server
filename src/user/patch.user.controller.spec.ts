import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Title } from 'src/title/title.entity';
import { TestService } from 'src/test/test.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let app: INestApplication;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let dataSources: DataSource;
  let testService: TestService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = moduleFixture.get<TestService>(TestService);
    dataSources = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await testService.createBasicCollectable();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
    await app.close();
  });

  describe('UserController', () => {
    let app: INestApplication;
    let dataSources: DataSource;
    let testService: TestService;
    let jwtService: JwtService;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
      testService = moduleFixture.get<TestService>(TestService);
      dataSources = moduleFixture.get<DataSource>(DataSource);
      //   jwtService = moduleFixture.get<JwtService>(JwtService);

      await testService.createBasicCollectable();
    });

    afterEach(async () => {
      jest.resetAllMocks();
      await dataSources.dropDatabase();
      await dataSources.destroy();
      await app.close();
    });

    describe('patch cases', () => {
      it('PATCH /users/{nickname}/detail', async () => {
        const user: User = await testService.createBasicUser();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/detail')
          .send({ imgUrl: 'changed', titleId: null, message: 'change message' })
          .set({ Authorization: 'Bearer ' + token });
        // console.log(response.statusCode);
        expect(response.statusCode).toBe(200);
      });
      it('PATCH /users/{nickname}/achievements', async () => {
        await testService.createBasicCollectable();
        const user: User =
          await testService.createUserWithUnSelectedAchievements();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/achievements')
          .set({ Authorization: 'Bearer ' + token })
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
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/emojis')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            emojis: [
              testService.emojis[0].id,
              testService.emojis[1].id,
              testService.emojis[2].id,
              testService.emojis[3].id,
            ],
          });
        expect(response.statusCode).toBe(200);
      });
    });
    // describe('error cases', () => {
    //   it('GET /users/', async () => {});
    // });
  });
});
