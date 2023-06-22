import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { TestService } from 'src/test/test.service';

describe('RankController', () => {
  let app: INestApplication;
  let dataSources: DataSource;
  let testService: TestService;
  initializeTransactionalContext();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    testService = moduleFixture.get<TestService>(TestService);
    dataSources = moduleFixture.get<DataSource>(DataSource);
    await dataSources.synchronize(true);
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
    await app.close();
  });

  afterEach(async () => {
    testService.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  describe('Get Test', () => {
    describe('/ranks/top?count={count}', () => {
      it('변수명 잘 들어오는지 확인', async () => {
        await testService.createBasicSeasons(1);
        await testService.createProfileImages();
        await testService.createBasicUsers();
        await testService.createBasicRank();
        await testService.createCurrentSeasonRank();
        const topCoount = 10;
        const response = await request(app.getHttpServer()).get(
          '/ranks/top?count=' + topCoount,
        );

        expect(response.status).toBe(200);
        expect(response.body.top[0]).toHaveProperty('rank');
        expect(response.body.top[0]).toHaveProperty('nickname');
        expect(response.body.top[0]).toHaveProperty('lp');
        expect(response.body.top[0]).toHaveProperty('imgUrl');
      });
      it('count에 따른 Top 랭크데이터 반환', async () => {
        await testService.createBasicSeasons(1);
        await testService.createProfileImages();
        await testService.createBasicUsers();
        await testService.createBasicRank();
        await testService.createCurrentSeasonRank();
        const topCoount = 10;
        const response = await request(app.getHttpServer()).get(
          '/ranks/top?count=' + topCoount,
        );

        expect(response.status).toBe(200);
        expect(response.body.top.length).toBe(topCoount);
        expect(response.body.top[0].rank).toBe(1);
        expect(response.body.top[0].nickname).toBe(
          testService.users[0].nickname,
        );
        expect(response.body.top[0].imgUrl).toBe(
          testService.users[0].image.url,
        );
        expect(response.body.top[1].rank).toBe(2);
        expect(response.body.top[2].rank).toBe(3);
        expect(response.body.top[3].rank).toBe(4);
        expect(response.body.top[4].rank).toBe(5);
        expect(response.body.top[5].rank).toBe(6);
        expect(response.body.top[6].rank).toBe(7);
        expect(response.body.top[7].rank).toBe(8);
        expect(response.body.top[8].rank).toBe(9);
        expect(response.body.top[9].rank).toBe(10);
      });
      it('전적이 하나도 없는경우', async () => {
        await testService.createBasicSeasons(1);
        await testService.createProfileImages();
        await testService.createBasicUsers();
        const topCoount = 10;
        const response = await request(app.getHttpServer()).get(
          '/ranks/top?count=' + topCoount,
        );

        expect(response.status).toBe(200);
        expect(response.body.top.length).toBe(0);
      });
    });
    describe('/ranks/bottom?count={count}&offset={offset}', () => {
      it('count에 따른 Bottom 랭크데이터 반환', async () => {
        await testService.createBasicSeasons(1);
        await testService.createProfileImages();
        await testService.createBasicUsers();
        await testService.createBasicRank();
        await testService.createCurrentSeasonRank();
        const bottomCount = 10;
        const offset = 4;
        const response = await request(app.getHttpServer()).get(
          '/ranks/bottom?count=' + bottomCount + '&offset=' + offset,
        );

        expect(response.status).toBe(200);
        expect(response.body.bottom.length).toBe(bottomCount - offset + 1);
        expect(response.body.bottom[0].rank).toBe(4);
        expect(response.body.bottom[0].nickname).toBe(
          testService.users[3].nickname,
        );

        expect(response.body.bottom[1].rank).toBe(5);
        expect(response.body.bottom[2].rank).toBe(6);
        expect(response.body.bottom[3].rank).toBe(7);
        expect(response.body.bottom[4].rank).toBe(8);
        expect(response.body.bottom[5].rank).toBe(9);
      });
      it('전적이 하나도 없는경우', async () => {
        await testService.createBasicSeasons(1);
        await testService.createProfileImages();
        await testService.createBasicUsers();
        const bottomCount = 10;
        const offset = 4;
        const response = await request(app.getHttpServer()).get(
          '/ranks/bottom?count=' + bottomCount + '&offset=' + offset,
        );

        expect(response.status).toBe(200);
        expect(response.body.bottom.length).toBe(0);
      });
    });
  });
  describe('Get Error Test', () => {
    describe('/ranks/top?count={count}', () => {
      it('count가 숫자가 아닌경우', async () => {
        const response = await request(app.getHttpServer()).get(
          '/ranks/top?count=abc',
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          'Validation failed (numeric string is expected)', //Binding pipes 가 제공하는 에러 코드
        );
      });
      it('count가 없는경우', async () => {
        const response = await request(app.getHttpServer()).get(
          '/ranks/top?count=',
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          'Validation failed (numeric string is expected)',
        );
      });
    });
    describe('/ranks/bottom?count={count}&offset={offset}', () => {
      it('count가 숫자가 아닌경우', async () => {
        const offset = 4;
        const response = await request(app.getHttpServer()).get(
          '/ranks/bottom?count=abc&offset=' + offset,
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          'Validation failed (numeric string is expected)',
        );
      });

      it('count가 없는경우', async () => {
        const offset = 4;
        const response = await request(app.getHttpServer()).get(
          '/ranks/bottom?count=&offset=' + offset,
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          'Validation failed (numeric string is expected)',
        );
      });

      it('offset이 숫자가 아닌경우', async () => {
        const bottomCount = 10;
        const response = await request(app.getHttpServer()).get(
          '/ranks/bottom?count=' + bottomCount + '&offset=abc',
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          'Validation failed (numeric string is expected)',
        );
      });

      it('offset이 없는경우', async () => {
        const bottomCount = 10;
        const response = await request(app.getHttpServer()).get(
          '/ranks/bottom?count=' + bottomCount + '&offset=',
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          'Validation failed (numeric string is expected)',
        );
      });
    });
  });
});
