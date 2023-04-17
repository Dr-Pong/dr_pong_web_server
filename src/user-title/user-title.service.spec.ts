import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserTitle } from 'src/user-title/user-title.entity';
import { UsertitleModule } from 'src/user-title/user-title.module';
import { Title } from 'src/title/title.entity';
import { TitleModule } from 'src/title/title.module';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserTitleService } from './user-title.service';
import { GetUserTitlesDto } from './dto/get.user.titles.dto';

describe('UserTitleService', () => {
  let service: UserTitleService;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let userTitleRepository: Repository<UserTitle>;
  let dataSources: DataSource;
  let users: User[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeORMConfig),
        UserModule,
        TitleModule,
        UsertitleModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Title),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserTitle),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserTitleService>(UserTitleService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userTitleRepository = module.get<Repository<UserTitle>>(
      getRepositoryToken(UserTitle),
    );
    titleRepository = module.get<Repository<Title>>(getRepositoryToken(Title));
    dataSources = module.get<DataSource>(DataSource);

    users = await userRepository.save([
      {
        nickname: 'testnick1',
        email: 'testemail1',
        imageUrl: 'testurl1',
        level: 1,
        statusMessage: 'testmessage1',
      },
      {
        nickname: 'testnick2',
        email: 'testemail2',
        imageUrl: 'testurl2',
        level: 2,
        statusMessage: 'testmessage2',
      },
      {
        nickname: 'testnick3',
        email: 'testemail3',
        imageUrl: 'testurl3',
        level: 3,
        statusMessage: 'testmessage3',
      },
    ]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 Get 모든 titles 테스트', async () => {
    // 타이틀생성
    const savedTitle = await titleRepository.save({
      name: 'the one',
      contents: 'neo',
    });
    const savedTitle2 = await titleRepository.save({
      name: 'the two',
      contents: 'two',
    });
    const savedTitle3 = await titleRepository.save({
      name: 'the three',
      contents: 'three',
    });

    let i = 0;
    for (const user of users) {
      // 유저에 저장
      await userTitleRepository.save({
        user: user,
        title: savedTitle,
        isSelected: i % 3 === 0,
      });
      await userTitleRepository.save({
        user: user,
        title: savedTitle2,
        isSelected: i % 3 === 1,
      });
      await userTitleRepository.save({
        user: user,
        title: savedTitle3,
        isSelected: i % 3 === 2,
      });
      i++;
    }

    //유저닉에따라 찾는부분
    const getUsersTitlesDto1: GetUserTitlesDto = {
      userId: users[0].id,
    };
    const getUsersTitlesDto2: GetUserTitlesDto = {
      userId: users[1].id,
    };
    const getUsersTitlesDto3: GetUserTitlesDto = {
      userId: users[2].id,
    };

    const result1 = await service.getUserTitles(getUsersTitlesDto1);
    const result2 = await service.getUserTitles(getUsersTitlesDto2);
    const result3 = await service.getUserTitles(getUsersTitlesDto3);

    //타이틀의 갯수
    expect(result1.titles.length).toBe(3);
    expect(result2.titles.length).toBe(3);
    expect(result3.titles.length).toBe(3);

    //resul1의 타이틀이름

    expect(result1.titles[0].title).toBe(savedTitle.name);
    expect(result1.titles[1].title).toBe(savedTitle2.name);
    expect(result1.titles[2].title).toBe(savedTitle3.name);

    expect(result2.titles[0].title).toBe(savedTitle.name);
    expect(result2.titles[1].title).toBe(savedTitle2.name);
    expect(result2.titles[2].title).toBe(savedTitle3.name);

    expect(result3.titles[0].title).toBe(savedTitle.name);
    expect(result3.titles[1].title).toBe(savedTitle2.name);
    expect(result3.titles[2].title).toBe(savedTitle3.name);
  });
});
