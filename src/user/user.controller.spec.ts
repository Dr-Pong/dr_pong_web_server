import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Title } from 'src/title/title.entity';
import { TestService } from 'src/test/test.service';
import { UserDetailResponseDto } from './dto/user.detail.response.dto';
import { UserAchievementsDto } from 'src/user-achievemet/dto/user.achievements.dto';

describe('UserController', () => {
  let controller: UserController;
  let app: INestApplication;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let dataSources: DataSource;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports:[AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = moduleFixture.get<TestService>(TestService);
    dataSources = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  describe('GET tests', () => {
    it('GET /users/me', async () => {
      const response = (await request(app.getHttpServer()).get('/users/me')).header(
        // jwt token init
      );
      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserMeResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/detail', async () => {
      const user: User = await testService.createBasicUsers(1)[0];
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserDetailResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/stat', async () => {
      const user: User = await testService.createBasicRank(1)[0].user;
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserStatResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/achievements?selected={true}', async () => {
      const user: User = await testService.createUserWithUnSelectedAchievements(9);
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserAchievementsResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/achievements?selected={false}', async () => {
      const user: User = await testService.createUserWithUnSelectedAchievements(9);
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserAchievementsResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/emojis?selected={true}', async () => {
      const user: User = await testService.createUserWithUnSelectedEmojis(9);
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserEmojisResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/emojis?selected={false}', async () => {
      const user: User = await testService.createUserWithUnSelectedEmojis(9);
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserEmojisResponseDto); //원하는 데이터 넣기
    });

    it('GET /users/{nickname}/titles', async () => {
      const response = await request(app.getHttpServer()).get('/users/' + user.nickname + '/detail');

      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(UserTitlesResponseDto); //원하는 데이터 넣기
    });
  });
  
  describe('patch cases', () => {
    it('PATCH /users/{nickname}/detail', async () => {
      const users: User[] = await testService.createBasicUsers(1);
      const response = await request(app.getHttpServer()).patch('/users/'+ users[0].nickname +'/detail');

      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
    });

    it('PATCH /users/{nickname}/achievements', async () => {
      const users: User[] = await testService.createBasicUsers(1);
      const response = await request(app.getHttpServer()).patch('/users/'+ users[0].nickname +'/detail');
      
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
    });
    
    it('PATCH /users/{nickname}/emojis', async () => {
      const users: User[] = await testService.createBasicUsers(1);
      const response = await request(app.getHttpServer()).patch('/users/'+ users[0].nickname +'/detail');

      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('error cases', () => {
    it('GET /users/', async () => {
      const response = await request(app.getHttpServer()).get('/users/nheo/detail');
      console.log(response.body);
      console.log(response.statusCode);
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe({}); //원하는 데이터 넣기
    });
  });
});
