import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserTitle } from 'src/domain/user-title/user-title.entity';
import { UsertitleModule } from 'src/domain/user-title/user-title.module';
import { UserTitleService } from './user-title.service';
import { GetUserTitlesDto } from './dto/get.user.titles.dto';
import { TestService } from 'src/test/test.service';
import { TestModule } from 'src/test/test.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('UserTitleService', () => {
  let service: UserTitleService;
  let testData: TestService;
  let userTitleRepository: Repository<UserTitle>;
  let dataSources: DataSource;

  initializeTransactionalContext();
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory() {
            return typeORMConfig;
          },
          async dataSourceFactory(options) {
            if (!options) {
              throw new Error('Invalid options passed');
            }
            return addTransactionalDataSource({ dataSource: new DataSource(options) });
          },
        }),
        UsertitleModule,
        TestModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(UserTitle),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserTitleService>(UserTitleService);
    userTitleRepository = module.get<Repository<UserTitle>>(
      getRepositoryToken(UserTitle),
    );
    dataSources = module.get<DataSource>(DataSource);
    testData = module.get<TestService>(TestService);
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testData.createProfileImages();
    await testData.createBasicCollectable();
  })

  afterEach(async () => {
    testData.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
  })

  it('유저 Get 모든 titles 테스트', async () => {
    const titleSelectedByUser = await testData.createUserWithCollectables();
    const nonSelectedCase = await testData.createUserWithUnSelectedTitles();

    //유저닉에따라 찾는부분
    const selectedRequest: GetUserTitlesDto = {
      userId: titleSelectedByUser.id,
    };
    const unSelectedCase: GetUserTitlesDto = {
      userId: nonSelectedCase.id,
    };
    const notExtistUser: GetUserTitlesDto = {
      userId: 9,
    };

    const result1 = await service.getUserTitles(selectedRequest);
    const result2 = await service.getUserTitles(unSelectedCase);
    const result3 = await service.getUserTitles(notExtistUser);
    //타이틀의 갯수

    expect(result1.titles.length).toBe(5);
    expect(result2.titles.length).toBe(5);
    expect(result3.titles.length).toBe(0);

    //resul1의 타이틀이름

    expect(result1.titles[0].title).toBe(testData.titles[0].name);
    expect(result1.titles[1].title).toBe(testData.titles[1].name);
    expect(result1.titles[2].title).toBe(testData.titles[2].name);

    expect(result2.titles[0].title).toBe(testData.titles[0].name);
    expect(result2.titles[1].title).toBe(testData.titles[1].name);
    expect(result2.titles[2].title).toBe(testData.titles[2].name);
  });
});
