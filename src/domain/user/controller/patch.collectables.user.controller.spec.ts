import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { TestService } from 'src/test/test.service';
import { UserTitle } from 'src/domain/user-title/user-title.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAchievement } from 'src/domain/user-achievement/user-achievement.entity';
import { UserEmoji } from 'src/domain/user-emoji/user-emoji.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { User } from '../user.entity';
import { UserService } from '../user.service';

describe('UserController', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userTitleRepository: Repository<UserTitle>;
  let userAchievementRepository: Repository<UserAchievement>;
  let userEmojiRepository: Repository<UserEmoji>;
  let dataSources: DataSource;
  let testService: TestService;
  let userService: UserService;
  initializeTransactionalContext();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserTitle),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserAchievement),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEmoji),
          useClass: Repository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = moduleFixture.get<TestService>(TestService);
    userService = moduleFixture.get<UserService>(UserService);
    dataSources = moduleFixture.get<DataSource>(DataSource);
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    userTitleRepository = moduleFixture.get<Repository<UserTitle>>(
      getRepositoryToken(UserTitle),
    );
    userAchievementRepository = moduleFixture.get<Repository<UserAchievement>>(
      getRepositoryToken(UserAchievement),
    );
    userEmojiRepository = moduleFixture.get<Repository<UserEmoji>>(
      getRepositoryToken(UserEmoji),
    );
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testService.createProfileImages();
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

  describe('PATCH cases', () => {
    describe('/users/{nickname}/message', () => {
      it('message를 변경한 경우', async () => {
        const user: User = await testService.createBasicUser();
        const token = await testService.giveTokenToUser(user);
        const body = {
          message: 'Patch change message',
        };
        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/message',
          body,
        );

        const result = await userRepository.findOne({
          where: { nickname: user.nickname },
        });
        expect(response.statusCode).toBe(200);
        expect(result.statusMessage).toBe('Patch change message');
      });
    });

    describe('users/{nickname}/image', () => {
      it('image를 변경한 경우', async () => {
        const user: User = await testService.createBasicUser();
        const token = await testService.giveTokenToUser(user);
        const body = {
          id: testService.profileImages[1].id,
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/image',
          body,
        );

        const result = await userRepository.findOne({
          where: { nickname: user.nickname },
        });

        expect(response.statusCode).toBe(200);
        expect(result.image.url).toBe(testService.profileImages[1].url);
      });
    });

    describe('/users/{nickname}/titles', () => {
      it('title을 선택한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          id: testService.titles[1].id,
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/title',
          body,
        );

        const result = await userTitleRepository.findOne({
          where: { user: { id: user.id }, isSelected: true },
        });
        expect(response.statusCode).toBe(200);
        expect(result.title.id).toBe(testService.titles[1].id);
      });
    });

    describe('/users/{nickname}/achievements', () => {
      it('achievements를 순서대로 선택한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [
            testService.achievements[0].id,
            testService.achievements[1].id,
            testService.achievements[2].id,
          ],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/achievements',
          body,
        );

        expect(response.statusCode).toBe(200);
        const result = await userAchievementRepository.find({
          where: { user: { id: user.id } },
        });

        expect(result[0].achievement.id).toBe(testService.achievements[0].id);
        expect(result[1].achievement.id).toBe(testService.achievements[1].id);
        expect(result[2].achievement.id).toBe(testService.achievements[2].id);
      });

      it('achievement을 임의의 순서대로 선택한경우', async () => {
        const user: User =
          await testService.createMixedSelectedAchievementUser();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [
            testService.achievements[2].id,
            null,
            testService.achievements[3].id,
          ],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/achievements',
          body,
        );

        const result = await userAchievementRepository.find({
          where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
        });

        expect(response.statusCode).toBe(200);
        expect(result[0].achievement.id).toBe(testService.achievements[2].id);
        expect(result[1].achievement.id).toBe(testService.achievements[3].id);

        expect(result[0].selectedOrder).toBe(0);
        expect(result[1].selectedOrder).toBe(2);
      });

      it('achievement을 선택하지 않은 경우 (전부 null)', async () => {
        const user: User =
          await testService.createUserWithUnSelectedAchievements();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [null, null, null],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/achievements',
          body,
        );

        const result = await userAchievementRepository.find({
          where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
        });

        expect(response.statusCode).toBe(200);
        expect(result.length).toBe(0);
      });
    });

    describe('/users/{nickname}/emojis', () => {
      it('emoji를 순서대로 선택한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [
            testService.emojis[0].id,
            testService.emojis[1].id,
            testService.emojis[2].id,
          ],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/emojis',
          body,
        );

        expect(response.statusCode).toBe(200);
        const result = await userEmojiRepository.find({
          where: { user: { id: user.id } },
        });

        expect(result[0].emoji.id).toBe(testService.emojis[0].id);
        expect(result[1].emoji.id).toBe(testService.emojis[1].id);
        expect(result[2].emoji.id).toBe(testService.emojis[2].id);

        expect(result[0].selectedOrder).toBe(0);
        expect(result[1].selectedOrder).toBe(1);
        expect(result[2].selectedOrder).toBe(2);
      });

      it('emoji를 임의의 순서대로 선택한경우', async () => {
        const user: User = await testService.createMixedSelectedEmojiUser();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [testService.emojis[2].id, null, testService.emojis[3].id],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/emojis',
          body,
        );

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
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [null, null, null],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/emojis',
          body,
        );

        const result = await userEmojiRepository.find({
          where: { user: { id: user.id }, selectedOrder: Not(IsNull()) },
        });
        expect(response.statusCode).toBe(200);
        expect(result.length).toBe(0);
      });
    });
  });

  describe('patch Error Cases Test', () => {
    describe('/users/{nickname}/image', () => {
      it('유저에게 없는 image를 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          id: 1000,
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/image',
          body,
        );

        expect(response.statusCode).toBe(404);
      });
    });

    describe('/users/{nickname}/titles', () => {
      it('유저에게 없는 title을 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          id: 1000,
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/title',
          body,
        );

        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/achievements', () => {
      it('유저에게 없는 achievement를 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [testService.achievements[9].id, null, null],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/achievements',
          body,
        );

        expect(response.statusCode).toBe(400);
      });
    });

    describe('/users/{nickname}/emojis', () => {
      it('유저에게 없는 emoji를 요청한 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const token = await testService.giveTokenToUser(user);
        const body = {
          ids: [testService.emojis[9].id, null, null],
        };

        const response = await req(
          token,
          'PATCH',
          '/users/' + user.nickname + '/emojis',
          body,
        );

        expect(response.statusCode).toBe(400);
      });
    });
  });

  const req = async (
    token: string,
    method: string,
    url: string,
    body?: object,
  ) => {
    switch (method) {
      case 'GET':
        return request(app.getHttpServer())
          .get(url)
          .set({ Authorization: `Bearer ${token}` });
      case 'POST':
        return request(app.getHttpServer())
          .post(url)
          .set({ Authorization: `Bearer ${token}` })
          .send(body);
      case 'PATCH':
        return request(app.getHttpServer())
          .patch(url)
          .set({ Authorization: `Bearer ${token}` })
          .send(body);
      case 'DELETE':
        return request(app.getHttpServer())
          .delete(url)
          .set({ Authorization: `Bearer ${token}` });
    }
  };
});
