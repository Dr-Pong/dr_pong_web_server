import { Test, TestingModule } from '@nestjs/testing';
import { UserAchievemetService } from './user-achievemet.service';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Achievemet } from 'src/achievemet/achievement.entity';
import { UserAchievement } from './user-achievement.entity';
import { Title } from 'src/title/title.entity';
import { GetUserAchievementsDto } from './dto/get.user.achievements.dto';
import { UserModule } from 'src/user/user.module';
import { AchievemetModule } from 'src/achievemet/achievemet.module';
import { UserAchievemetModule } from './user-achievemet.module';

describe('UserAchievemetService', () => {
  let service: UserAchievemetService;
  let userRepository: Repository<User>;
  let userAchievementRepository: Repository<UserAchievement>;
  let acheivementRepository: Repository<Achievemet>;
  let dataSources: DataSource;
  let users: User[];
  let acheives: Achievemet[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        UserAchievemetService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Achievemet),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserAchievement),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserAchievemetService>(UserAchievemetService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userAchievementRepository = module.get<Repository<UserAchievement>>(
      getRepositoryToken(UserAchievement),
    );
    acheivementRepository = module.get<Repository<Achievemet>>(
      getRepositoryToken(Achievemet),
    );
    dataSources = module.get<DataSource>(DataSource);

    //미리 유저 3개 저장
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

    //acheivement 6개 저장
    acheives = await acheivementRepository.save([
      {
        name: 'acheive1',
        content: 'acheive content1',
        imageUrl: 'acheiveImageUrl1',
      },
      {
        name: 'acheive2',
        content: 'acheive content2',
        imageUrl: 'acheiveImageUrl2',
      },
      {
        name: 'acheive3',
        content: 'acheive content3',
        imageUrl: 'acheiveImageUrl3',
      },
      {
        name: 'acheive4',
        content: 'acheive content4',
        imageUrl: 'acheiveImageUrl4',
      },
      {
        name: 'acheive5',
        content: 'acheive content5',
        imageUrl: 'acheiveImageUrl5',
      },
      {
        name: 'acheive6',
        content: 'acheive content6',
        imageUrl: 'acheiveImageUrl6',
      },
    ]);
  });

  afterEach(async () => {
    // afterEach가 없어서 일단 만들었는데 여기가 맞는지 모르겠음
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('전체 업적 조회', async () => {
    //given
    await userAchievementRepository.save([
      {
        user: users[0],
        achievement: acheives[3],
        isSelected: true,
      },
      {
        user: users[0],
        achievement: acheives[4],
        isSelected: false,
      },
      {
        user: users[1],
        achievement: acheives[5],
        isSelected: false,
      },
    ]);

    //user1 : selected와 acheieved, unacheieved가 전부 있음
    const getDto1: GetUserAchievementsDto = {
      userId: users[0].id,
      isSelected: false,
    };
    //user2 : selected 없는 상태
    const getDto2: GetUserAchievementsDto = {
      userId: users[1].id,
      isSelected: false,
    };
    //user3 : acheieved도 없는 상태
    const getDto3: GetUserAchievementsDto = {
      userId: users[2].id,
      isSelected: false,
    };

    //when
    const user1Acheivements = await service.getUserAchievements(getDto1);
    const user2Acheivements = await service.getUserAchievements(getDto2);
    const user3Acheivements = await service.getUserAchievements(getDto3);

    //then
    console.log(user1Acheivements.achievements);
    expect(user1Acheivements.achievements.length).toBe(acheives.length);
    expect(user1Acheivements.achievements[0].status).toBe('unachieved');
    expect(user1Acheivements.achievements[1].status).toBe('unachieved');
    expect(user1Acheivements.achievements[2].status).toBe('unachieved');
    expect(user1Acheivements.achievements[3].status).toBe('selected');
    expect(user1Acheivements.achievements[4].status).toBe('achieved');
    expect(user1Acheivements.achievements[5].status).toBe('unachieved');

    expect(user2Acheivements.achievements.length).toBe(acheives.length);
    expect(user2Acheivements.achievements[0].status).toBe('unachieved');
    expect(user2Acheivements.achievements[1].status).toBe('unachieved');
    expect(user2Acheivements.achievements[2].status).toBe('unachieved');
    expect(user2Acheivements.achievements[3].status).toBe('unachieved');
    expect(user2Acheivements.achievements[4].status).toBe('unachieved');
    expect(user2Acheivements.achievements[5].status).toBe('achieved');

    expect(user3Acheivements.achievements.length).toBe(acheives.length);
    expect(user3Acheivements.achievements[0].status).toBe('unachieved');
    expect(user3Acheivements.achievements[1].status).toBe('unachieved');
    expect(user3Acheivements.achievements[2].status).toBe('unachieved');
    expect(user3Acheivements.achievements[3].status).toBe('unachieved');
    expect(user3Acheivements.achievements[4].status).toBe('unachieved');
    expect(user3Acheivements.achievements[5].status).toBe('unachieved');
  });

  it('선택한 업적 조회', async () => {
    //given
    await userAchievementRepository.save([
      {
        user: users[0],
        achievement: acheives[0],
        isSelected: true,
      },
      {
        user: users[0],
        achievement: acheives[1],
        isSelected: true,
      },
      {
        user: users[0],
        achievement: acheives[2],
        isSelected: true,
      },
      {
        user: users[1],
        achievement: acheives[0],
        isSelected: true,
      },
    ]);

    //when
    //user1 : selected 3개인 경우
    const getDto1: GetUserAchievementsDto = {
      userId: users[0].id,
      isSelected: true,
    };
    //user2 : selected 1개만 있는 상태
    const getDto2: GetUserAchievementsDto = {
      userId: users[1].id,
      isSelected: true,
    };
    //user3 : selected 없는 상태
    const getDto3: GetUserAchievementsDto = {
      userId: users[2].id,
      isSelected: true,
    };

    const user1SelectedAcheivements = await service.getUserAchievements(
      getDto1,
    );
    const user2SelectedAcheivements = await service.getUserAchievements(
      getDto2,
    );
    const user3SelectedAcheivements = await service.getUserAchievements(
      getDto3,
    );

    //then
    expect(user1SelectedAcheivements.achievements.length).toBe(3);
    expect(user1SelectedAcheivements.achievements[0].name).toBe(
      acheives[0].name,
    );
    expect(user1SelectedAcheivements.achievements[1].name).toBe(
      acheives[1].name,
    );
    expect(user1SelectedAcheivements.achievements[2].name).toBe(
      acheives[2].name,
    );

    expect(user2SelectedAcheivements.achievements.length).toBe(1);
    expect(user2SelectedAcheivements.achievements[0].name).toBe(
      acheives[0].name,
    );

    expect(user3SelectedAcheivements.achievements.length).toBe(0);
  });
});
