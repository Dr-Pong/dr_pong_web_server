import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { TestService } from 'src/test/test.service';
import { JwtService } from '@nestjs/jwt';
import {
  COLLECTABLE_ACHIEVED,
  COLLECTABLE_SELECTED,
  COLLECTABLE_UNACHIEVED,
} from 'src/global/type/type.collectable.status';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UserService } from './user.service';

describe('UserController', () => {
  let app: INestApplication;
  let dataSources: DataSource;
  let testService: TestService;
  let userService: UserService;
  let jwtService: JwtService;
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
    jwtService = moduleFixture.get<JwtService>(JwtService);
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
    it('GET /users/me', async () => {
      // const response = (await request(app.getHttpServer()).get('/users/me')).header(
      //   // jwt token init
      // );
      // expect(response.statusCode).toBe(200);
    });

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

    describe('/users/{nickname}/ranks/season', () => {
      it('유저 현시즌 record rank tier반환', async () => {
        const user: User = await testService.createBasicUser();
        const response = await request(app.getHttpServer()).get(
          '/users/' + user.nickname + '/ranks/season',
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('rank');
        expect(response.body).toHaveProperty('tier');
        expect(response.body).toHaveProperty('record');
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
        expect(response.body).toHaveProperty('record');
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
      it('GET /users/{nickname}/detail', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/detail',
        );
        expect(response.statusCode).toBe(404);
      });
      it('GET /users/{nickname}/stat', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/stat',
        );
        expect(response.statusCode).toBe(404);
      });

      it('GET /users/{nickname}/achievement?selected=true', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/achievement?selected=true',
        );
        expect(response.statusCode).toBe(404);
      });

      it('GET /users/{nickname}/achievement?selected=false', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/achievement?selected=false',
        );
        expect(response.statusCode).toBe(404);
      });

      it('GET /users/{nickname}/emojis?selected=true', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/emojis?selected=true',
        );
        expect(response.statusCode).toBe(404);
      });

      it('GET /users/{nickname}/emojis?selected=false', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/emojis?selected=false',
        );
        expect(response.statusCode).toBe(404);
      });

      it('GET /users/{nickname}/titles', async () => {
        const response = await request(app.getHttpServer()).get(
          '/users/' + 'notExistNickname' + '/titles',
        );
        expect(response.statusCode).toBe(404);
      });
    });
  });
});
