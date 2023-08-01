import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { TestService } from 'src/test/data/test.service';
import {
  COLLECTABLE_ACHIEVED,
  COLLECTABLE_SELECTED,
  COLLECTABLE_UNACHIEVED,
} from 'src/global/type/type.collectable.status';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UserService } from '../../../../domain/user/user.service';
import { User } from '../../../../domain/user/user.entity';

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
    describe('/users/images', () => {
      it('선택할 수 있는 이미지 조회', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/images',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('images');
        expect(response.body.images.length).toBe(2);
      });
    });

    describe('/users/{nickname}/achievements?selected=true', () => {
      it('선택된 업적이 없는경우', async () => {
        const user: User =
          await testService.createUserWithUnSelectedAchievements();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/achievements?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(response.body.achievements[0]).toBe(null);
        expect(response.body.achievements[1]).toBe(null);
        expect(response.body.achievements[2]).toBe(null);
      });

      it('업적이 순서대로 선택된 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/achievements?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(response.body.achievements[1].id).toBeGreaterThan(
          response.body.achievements[0].id,
        );
        expect(response.body.achievements[2].id).toBeGreaterThan(
          response.body.achievements[1].id,
        );
      });

      it('업적이 임의의 순서대로 선택된 경우', async () => {
        const user: User =
          await testService.createReverseSelectedAchievementUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/achievements?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(response.body.achievements[1].id).toBeGreaterThan(
          response.body.achievements[2].id,
        );
        expect(response.body.achievements[0].id).toBeGreaterThan(
          response.body.achievements[1].id,
        );
      });

      it('업적이 중간에 빈체로 선택된 경우 (뻥꾸난 경우)', async () => {
        const user: User =
          await testService.createMixedSelectedAchievementUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/achievements?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(
          response.body.achievements.some(
            (achievement) => achievement === null,
          ),
        ).toBe(true);
      });
    });

    describe('/users/{nickname}/achievements?selected=false', () => {
      it('achieve, selected 둘다 없는경우', async () => {
        const unAchievedUser: User =
          await testService.createUserWithUnAchievedAchievements();
        const unSelectedUser: User =
          await testService.createUserWithUnSelectedAchievements();
        const response = await request(app.getHttpServer()).get(
          '/users/' + unAchievedUser.nickname + '/achievements?selected=false',
        );
        const response2 = await request(app.getHttpServer()).get(
          '/users/' + unSelectedUser.nickname + '/achievements?selected=false',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(response.body.achievements[0].status).toBe(
          COLLECTABLE_UNACHIEVED,
        );
        expect(response.body.achievements[1].status).toBe(
          COLLECTABLE_UNACHIEVED,
        );
        expect(response.body.achievements[2].status).toBe(
          COLLECTABLE_UNACHIEVED,
        );
        expect(response2.body.achievements[0].status).toBe(
          COLLECTABLE_ACHIEVED,
        );
        expect(response2.body.achievements[1].status).toBe(
          COLLECTABLE_ACHIEVED,
        );
        expect(response2.body.achievements[2].status).toBe(
          COLLECTABLE_ACHIEVED,
        );
      });

      it('achieve 만 있고 selected 없는경우', async () => {
        const unSelectedUser: User =
          await testService.createUserWithUnSelectedAchievements();
        const response = await request(app.getHttpServer()).get(
          '/users/' + unSelectedUser.nickname + '/achievements?selected=false',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(response.body.achievements[0].status).toBe(COLLECTABLE_ACHIEVED);
        expect(response.body.achievements[1].status).toBe(COLLECTABLE_ACHIEVED);
        expect(response.body.achievements[2].status).toBe(COLLECTABLE_ACHIEVED);
      });

      it('achieve, selected 둘다 있는경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/achievements?selected=false',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(response.body.achievements[0].status).toBe(COLLECTABLE_SELECTED);
        expect(response.body.achievements[1].status).toBe(COLLECTABLE_SELECTED);
        expect(response.body.achievements[2].status).toBe(COLLECTABLE_SELECTED);
      });
    });

    describe('/users/{nickname}/emojis?selected=true', () => {
      it('선택된 이모티콘이 없는경우', async () => {
        const user: User = await testService.createUserWithUnSelectedEmojis();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis[0]).toBe(null);
        expect(response.body.emojis[1]).toBe(null);
        expect(response.body.emojis[2]).toBe(null);
      });

      it('이모티콘이 순서대로 선택된 경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis[1].id).toBeGreaterThan(
          response.body.emojis[0].id,
        );
        expect(response.body.emojis[2].id).toBeGreaterThan(
          response.body.emojis[1].id,
        );
      });

      it('이모티콘이 임의의 순서대로 선택된 경우', async () => {
        const user: User = await testService.createReverseSelectedEmojiUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis[1].id).toBeGreaterThan(
          response.body.emojis[2].id,
        );
        expect(response.body.emojis[0].id).toBeGreaterThan(
          response.body.emojis[1].id,
        );
      });

      it('이모티콘이 중간에 빈체로 선택된 경우 (뻥꾸난 경우)', async () => {
        const user: User = await testService.createMixedSelectedEmojiUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=true',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis.some((emoji) => emoji === null)).toBe(true);
      });
    });

    describe('/users/{nickname}/emojis?selected=false', () => {
      it('achieve, selected 둘다 없는경우', async () => {
        const user: User = await testService.createUserWithUnAchievedEmoji();
        const user2: User = await testService.createUserWithUnSelectedEmojis();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=false',
        );
        const response2 = await request(app.getHttpServer()).get(
          '/users/' + user2.nickname + '/emojis?selected=false',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis[0].status).toBe(COLLECTABLE_UNACHIEVED);
        expect(response.body.emojis[1].status).toBe(COLLECTABLE_UNACHIEVED);
        expect(response.body.emojis[2].status).toBe(COLLECTABLE_UNACHIEVED);
        expect(response2.statusCode).toBe(200);
        expect(response2.body).toHaveProperty('emojis');
        expect(response2.body.emojis[0].status).toBe(COLLECTABLE_ACHIEVED);
        expect(response2.body.emojis[1].status).toBe(COLLECTABLE_ACHIEVED);
        expect(response2.body.emojis[2].status).toBe(COLLECTABLE_ACHIEVED);
      });

      it('achieved 만있고 selected 없는경우', async () => {
        const user: User = await testService.createUserWithUnSelectedEmojis();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=false',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis[0].status).toBe(COLLECTABLE_ACHIEVED);
        expect(response.body.emojis[1].status).toBe(COLLECTABLE_ACHIEVED);
        expect(response.body.emojis[2].status).toBe(COLLECTABLE_ACHIEVED);
      });

      it('achieve, selected 둘다 있는경우', async () => {
        const user: User = await testService.createUserWithCollectables();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/emojis?selected=false',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('emojis');
        expect(response.body.emojis[0].status).toBe(COLLECTABLE_SELECTED);
        expect(response.body.emojis[1].status).toBe(COLLECTABLE_SELECTED);
        expect(response.body.emojis[2].status).toBe(COLLECTABLE_SELECTED);
      });
    });

    describe('/users/{nickname}/titles', () => {
      it('얻은 칭호가 없는경우', async () => {
        const user: User = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/titles',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('titles');
        expect(response.body.titles.length).toBe(0);
      });
      it('select한 칭호가 있는 경우', async () => {
        const user: User = await testService.createUserWithSelectedTitles();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/titles',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('titles');
        expect(response.body.titles.length).toBe(5);
      });
      it('select한 칭호가 없는 경우', async () => {
        const user: User = await testService.createUserWithUnSelectedTitles();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/titles',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('titles');
        expect(response.body.titles.length).toBe(5);
      });
    });

    describe('Error Cases Test', () => {
      it('GET /users/{nickname}/achievements?selected=true', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/achievements?selected=true',
        );

        expect(response.body.achievements).toStrictEqual([null, null, null]);
        expect(response.statusCode).toBe(200);
      });

      it('GET /users/{nickname}/emojis?selected=true', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/emojis?selected=true',
        );

        expect(response.body.emojis).toStrictEqual([null, null, null, null]);
        expect(response.statusCode).toBe(200);
      });

      it('GET /users/{nickname}/titles', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/titles',
        );

        expect(response.body.titles).toStrictEqual([]);
        expect(response.statusCode).toBe(200);
      });
    });
  });
});
