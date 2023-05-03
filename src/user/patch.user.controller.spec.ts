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
import { UserEmoji } from 'src/user-emoji/user-emoji.entity';

describe('UserController', () => {
  let controller: UserController;
  let app: INestApplication;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let userTitleRepository: Repository<UserTitle>;
  let userAchievementRepository: Repository<UserAchievement>;
  let userEmojiRepository: Repository<UserEmoji>;
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

  describe('PATCH cases', () => {
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
      userEmojiRepository = moduleFixture.get<Repository<UserEmoji>>(
        getRepositoryToken(UserEmoji),
      );

      await testService.createBasicCollectable();
    });

    afterEach(async () => {
      jest.resetAllMocks();
      await dataSources.dropDatabase();
      await dataSources.destroy();
      await app.close();
    });

    describe('/users/{nickname}/message', () => {
      it('message를 변경한 경우', async () => {
        const user: User = await testService.createBasicUser();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/message')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            message: 'change message',
          });
        // console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('change message');
      });
    });

    describe('users/{nickname}/image', () => {
      it('image를 변경한 경우', async () => {
        const user: User = await testService.createBasicUser();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/image')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            imgUrl: 'change image',
          });
        // console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body.imgUrl).not.toBe(null);
      });
    });

    describe('/users/{nickname}/titles', () => {
      it('titles를 순서대로 선택한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/titles')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            titles: [
              testService.titles[0].id,
              testService.titles[1].id,
              testService.titles[2].id,
            ],
          });

        // console.log(response.statusCode);
        const result = await userTitleRepository.findOne({
          where: { user: { id: user.id }, isSelected: true },
        });
        expect(response.statusCode).toBe(200);
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

    describe('/users/{nickname}/emojis', () => {
      it('emoji를 순서대로 선택한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
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
            ],
          });

        // console.log(response.statusCode);
        expect(response.statusCode).toBe(200);
        const result = await userEmojiRepository.find({
          where: { user: { id: user.id } },
        });
        // console.log(result);
        expect(result[0].emoji.id).toBe(testService.emojis[0].id);
        expect(result[1].emoji.id).toBe(testService.emojis[1].id);
        expect(result[2].emoji.id).toBe(testService.emojis[2].id);

        expect(result[0].selectedOrder).toBe(0);
        expect(result[1].selectedOrder).toBe(1);
        expect(result[2].selectedOrder).toBe(2);
      });

      it('emoji를 임의의 순서대로 선택한경우', async () => {
        const user: User = await testService.createMixedSelectedEmojiUser();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/emojis')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            emojis: [testService.emojis[2].id, null, testService.emojis[3].id],
          });

        const result = await userEmojiRepository.find({
          where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
        });
        expect(response.statusCode).toBe(200);
        expect(result[0].emoji.id).toBe(testService.emojis[2].id);
        expect(result[1].emoji.id).toBe(testService.emojis[3].id);

        expect(result[0].selectedOrder).toBe(0);
        expect(result[1].selectedOrder).toBe(2);
      });

      it('emoji를 선택하지 않은 경우 (전부 null)', async () => {
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
            emojis: [null, null, null],
          });

        const result = await userEmojiRepository.find({
          where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
        });
        expect(response.statusCode).toBe(200);
        expect(result.length).toBe(0);
      });
    });
  });

  describe('patch Error Cases Test', () => {
    describe('/users/{nickname}/detail', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/detail')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            nickname: 'testNickname',
            imagUrl: 'testImageUrl',
            title: 'testTitle',
          });
        // console.log(response.body);

        expect(response.statusCode).toBe(404);
      });

      it('nickname이 null인 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + null + '/detail')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            nickname: 'testNickname',
            imagUrl: 'testImageUrl',
            title: 'testTitle',
          });
        expect(response.statusCode).toBe(404);
      });

      it('유저에게 없는 title을 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/detail')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            nickname: 'testNickname',
            imgeUrl: 'testImageUrl',
            title: testService.titles[9].id,
          });

        // console.log(response.body);
        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/messages', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/messages')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            messgae: 'testMessage',
          });

        expect(response.statusCode).toBe(404);
      });

      it('nickname이 null인 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + null + '/detail')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            message: 'testMessage',
          });
        expect(response.statusCode).toBe(404);
      });
    });

    describe('/users/{nickname}/image', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/image')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            imgUrl: 'testImageUrl',
          });

        expect(response.statusCode).toBe(404);
      });

      it('nickname이 null인 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + null + '/image')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            imagUrl: 'testImageUrl',
          });
        expect(response.statusCode).toBe(404);
      });

      it('유저에게 없는 image를 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/image')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            imgeUrl: testService.images[9].id,
          });

        // console.log(response.body);
        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/titles', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/titles')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            title: 'testTitle',
          });

        expect(response.statusCode).toBe(404);
      });

      it('nickname이 null인 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + null + '/titles')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            title: 'testTitle',
          });
        expect(response.statusCode).toBe(404);
      });

      it('유저에게 없는 title을 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/titles')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            title: testService.titles[9].id,
          });

        // console.log(response.body);
        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/achievements', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/achievements')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            nickname: 'testNickname',
            imagUrl: 'testImageUrl',
            title: 'testTitle',
          });

        expect(response.statusCode).toBe(404);
      });

      it('유저에게 없는 achievement를 요청한 경우', async () => {
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
            achievements: [testService.achievements[9].id],
          });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/emojis', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/emojis')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            nickname: 'testNickname',
            imagUrl: 'testImageUrl',
            title: 'testTitle',
          });

        expect(response.statusCode).toBe(404);
      });

      it('유저에게 없는 emoji를 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/emojis')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            emojis: [testService.emojis[9].id],
          });

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
