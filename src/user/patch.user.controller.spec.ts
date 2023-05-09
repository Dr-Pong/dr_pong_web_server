import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { TestService } from 'src/test/test.service';
import { JwtService } from '@nestjs/jwt';
import { UserTitle } from 'src/user-title/user-title.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAchievement } from 'src/user-achievement/user-achievement.entity';
import { UserEmoji } from 'src/user-emoji/user-emoji.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserController', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userTitleRepository: Repository<UserTitle>;
  let userAchievementRepository: Repository<UserAchievement>;
  let userEmojiRepository: Repository<UserEmoji>;
  let dataSources: DataSource;
  let testService: TestService;
  let jwtService: JwtService;
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
    jwtService = moduleFixture.get<JwtService>(JwtService);
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

  describe('PATCH cases', () => {
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
            message: 'Patch change message',
          });
        // console.log(response.body);
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
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });
        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/image')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            id: testService.profileImages[1].id,
          });
        // console.log(response.body);

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
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/title')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            id: testService.titles[1].id,
          });

        // console.log(response.statusCode);
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
        const token = jwtService.sign({
          id: user.id,
          nickname: user.nickname,
          roleType: user.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + user.nickname + '/achievements')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            ids: [
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
            ids: [
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
            ids: [null, null, null],
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
            ids: [
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
            ids: [testService.emojis[2].id, null, testService.emojis[3].id],
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
            ids: [null, null, null],
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
    describe('/users/{nickname}/messages', () => {
      it('존재하지 않는 유저의 경우', async () => {
        const basicUser = await testService.createBasicUser();
        const token = jwtService.sign({
          id: basicUser.id,
          nickname: basicUser.nickname,
          roleType: basicUser.roleType,
        });

        const response = await request(app.getHttpServer())
          .patch('/users/' + 'nonono' + '/message')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            messgae: 'testMessage',
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
            id: testService.profileImages[0].id,
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
            id: 1000, // testdptj images[] 선언후  testservice에 있는 이미지 아이디가 아니라서 400이 나와야함
          });

        // console.log(response.body);
        expect(response.statusCode).toBe(404);
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
          .patch('/users/' + 'nonono' + '/title')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            id: testService.titles[0].id,
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
          .patch('/users/' + user.nickname + '/title')
          .set({ Authorization: 'Bearer ' + token })
          .send({
            id: testService.titles[9].id,
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
            ids: [null, null, null],
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
            ids: [testService.achievements[9].id, null, null],
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
            ids: [null, null, null],
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
            ids: [testService.emojis[9].id, null, null],
          });

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
