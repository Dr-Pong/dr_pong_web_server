import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { Title } from 'src/title/title.entity';
import { TestService } from 'src/test/test.service';
import { JwtService } from '@nestjs/jwt';
import { UserTitle } from 'src/user-title/user-title.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAchievement } from 'src/user-achievement/user-achievement.entity';

describe('UserController', () => {
  let controller: UserController;
  let app: INestApplication;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let userTitleRepository: Repository<UserTitle>;
  let userAchievementRepository: Repository<UserAchievement>;
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
      jwtService = moduleFixture.get<JwtService>(JwtService);
      userTitleRepository = moduleFixture.get<Repository<UserTitle>>(
        getRepositoryToken(UserTitle),
      );
      userAchievementRepository = moduleFixture.get<
        Repository<UserAchievement>
      >(getRepositoryToken(UserAchievement));

      await testService.createBasicCollectable();
    });

    afterEach(async () => {
      jest.resetAllMocks();
      await dataSources.dropDatabase();
      await dataSources.destroy();
      await app.close();
    });

    describe('PATCH cases', () => {
      describe('/users/{nickname}/detail', () => {
        it('nickname 의 titile이 null인경우', async () => {
          const user: User = await testService.createBasicUser();
          const token = jwtService.sign({
            id: user.id,
            nickname: user.nickname,
            roleType: user.roleType,
          });
          const response = await request(app.getHttpServer())
            .patch('/users/' + user.nickname + '/detail')
            .set({ Authorization: 'Bearer ' + token })
            .send({
              imgUrl: 'changed',
              title: null,
              message: 'change message',
            });
          // console.log(response.body);
          const result = await userTitleRepository.findOne({
            where: { user: { id: user.id }, isSelected: true },
          });

          // console.log(response.body.title);
          expect(response.statusCode).toBe(200);
          expect(result).toBe(null);
        });

        it('nickname 의 title이 있는경우', async () => {
          const user: User = await testService.createUserWithSelectedTitles();
          const token = jwtService.sign({
            id: user.id,
            nickname: user.nickname,
            roleType: user.roleType,
          });
          const response = await request(app.getHttpServer())
            .patch('/users/' + user.nickname + '/detail')
            .set({ Authorization: 'Bearer ' + token })
            .send({
              imgUrl: 'changed',
              title: testService.titles[0].id,
              message: 'change message',
            });
          // console.log(response.statusCode);
          expect(response.statusCode).toBe(200);
          const result = await userTitleRepository.findOne({
            where: { user: { id: user.id }, isSelected: true },
          });
          // console.log(result);
          expect(result.title.id).toBe(testService.titles[0].id);
        });
      });

      describe('/users/{nickname}/achievements', () => {
        it('achievements를 순서대로 선택한 경우', async () => {
          const user: User = await testService.createUserWithCollectables();
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
          const result = await userAchievementRepository.find({
            where: { user: { id: user.id } },
          });
          // console.log(result);
          expect(result[0].achievement.id).toBe(testService.achievements[0].id);
          expect(result[1].achievement.id).toBe(testService.achievements[1].id);
          expect(result[2].achievement.id).toBe(testService.achievements[2].id);
        });

        it('achievement을 임의의 순서대로 선택한경우', async () => {
          const user: User =
            await testService.createMixedSelectedAchievementUser();
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
                testService.achievements[2].id,
                null,
                testService.achievements[3].id,
              ],
            });
          // console.log(response.statusCode);
          const result = await userAchievementRepository.find({
            where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
          });
          // console.log('response', response.body);
          expect(response.statusCode).toBe(200);
          expect(result[0].achievement.id).toBe(testService.achievements[2].id);
          expect(result[1].achievement.id).toBe(testService.achievements[3].id);

          expect(result[0].selectedOrder).toBe(0);
          expect(result[1].selectedOrder).toBe(2);
        });

        it('achievement을 선택하지 않은 경우 (전부 null)', async () => {
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
              achievements: [null, null, null],
            });
          // console.log(response.body);
          const result = await userAchievementRepository.find({
            where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
          });
          // console.log(result);
          expect(response.statusCode).toBe(200);
          expect(result.length).toBe(0);
        });
      });
    });

    // it('PATCH /users/{nickname}/achievements', async () => {
    //   await testService.createBasicCollectable();
    //   const user: User =
    //     await testService.createUserWithUnSelectedAchievements();
    //   const token = jwtService.sign({
    //     id: user.id,
    //     nickname: user.nickname,
    //     roleType: user.roleType,
    //   });
    //   const response = await request(app.getHttpServer())
    //     .patch('/users/' + user.nickname + '/achievements')
    //     .set({ Authorization: 'Bearer ' + token })
    //     .send({
    //       achievements: [
    //         testService.achievements[0].id,
    //         testService.achievements[1].id,
    //         testService.achievements[2].id,
    //       ],
    //     });
    //   // console.log(response.statusCode);
    //   expect(response.statusCode).toBe(200);
    // });
    // it('PATCH /users/{nickname}/emojis', async () => {
    //   await testService.createBasicCollectable();
    //   const user: User = await testService.createUserWithUnSelectedEmojis();
    //   const token = jwtService.sign({
    //     id: user.id,
    //     nickname: user.nickname,
    //     roleType: user.roleType,
    //   });
    //   const response = await request(app.getHttpServer())
    //     .patch('/users/' + user.nickname + '/emojis')
    //     .set({ Authorization: 'Bearer ' + token })
    //     .send({
    //       emojis: [
    //         testService.emojis[0].id,
    //         testService.emojis[1].id,
    //         testService.emojis[2].id,
    //         testService.emojis[3].id,
    //       ],
    //     });
    //   expect(response.statusCode).toBe(200);
    // });
    // describe('error cases', () => {
    //   it('GET /users/', async () => {});
    // });
  });
});
