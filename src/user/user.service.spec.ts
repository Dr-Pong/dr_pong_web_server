import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UsertitleModule } from 'src/user-title/user-title.module';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { Title } from 'src/title/title.entity';
import { TitleModule } from 'src/title/title.module';
import { PatchUserTitleDto } from './dto/patch.user.title.dto';
import { PatchUsersDetailRequestDto } from './dto/patch.users.detail.request.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import exp from 'constants';
import { async } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let userTitleRepository: Repository<UserTitle>;
  let dataSources: DataSource;
  let users: User[];

  beforeEach(async () => {
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

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userTitleRepository = module.get<Repository<UserTitle>>(
      getRepositoryToken(UserTitle),
    );
    titleRepository = module.get<Repository<Title>>(getRepositoryToken(Title));
    dataSources = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 Get 정보 & 선택 title 테스트 ', async () => {
    //given
    const user1 = await userRepository.save({
      level: 1,
      nickname: 'titleTestNickname',
      imageUrl: 'titleTestUrl',
      statusMessage: 'titleTestStatus',
      email: 'titleTest@email',
    });

    const user2 = await userRepository.save({
      level: 2,
      nickname: '2titleTestNickname',
      imageUrl: '2titleTestUrl',
      statusMessage: '2titleTestStatus',
      email: '2titleTest@email',
    });

    const user1SelectedTitle = await titleRepository.save({
      name: '1titleName',
      contents: '1titleContents',
    });
    const title2 = await titleRepository.save({
      name: '2titleName',
      contents: '2titleContents',
    });
    const title3 = await titleRepository.save({
      name: '3titleName',
      contents: '3titleContents',
    });
    const user2SelectedTitle = await titleRepository.save({
      name: '4titleName',
      contents: '4titleContents',
    });
    const title5 = await titleRepository.save({
      name: '5titleName',
      contents: '5titleContents',
    });

    await userTitleRepository.save({
      user: user1,
      title: user1SelectedTitle,
      isSelected: true,
    });
    await userTitleRepository.save({
      user: user1,
      title: title2,
      isSelected: false,
    });
    await userTitleRepository.save({
      user: user1,
      title: title3,
      isSelected: false,
    });
    await userTitleRepository.save({
      user: user2,
      title: user2SelectedTitle,
      isSelected: true,
    });
    await userTitleRepository.save({
      user: user2,
      title: title5,
      isSelected: false,
    });

    const getUserSelectedTitleDto: GetUserSelectedTitleDto = {
      nickname: 'titleTestNickname',
    };
    const getUserSelectedTitleDto2: GetUserSelectedTitleDto = {
      nickname: '2titleTestNickname',
    };

    //when
    const result = await service.getUserSelectedTitle(getUserSelectedTitleDto);
    const result2 = await service.getUserSelectedTitle(
      getUserSelectedTitleDto2,
    );

    //then
    expect(result.title).toBe(user1SelectedTitle.name);
    expect(result2.title).toBe(user2SelectedTitle.name);
  });

  it('유저 Patch 정보 & title 테스트', async () => {
    //given
    const user = await userRepository.save({
      nickname: 'testnick',
      email: 'testemail',
      imageUrl: 'testurl',
      level: 1,
      statusMessage: 'testmessage',
    });

    const savedTitle = await titleRepository.save({
      name: 'the one',
      contents: 'neo',
    });

    await userTitleRepository.save({
      user: user,
      title: savedTitle,
      isSelected: true,
    });

    const patchUsersDetailDto: PatchUserDetailDto = {
      nickname: 'testnick',
      imgUrl: 'testurl',
      message: 'testmessage',
    };

    const patchUsersTitleDto: PatchUserTitleDto = {
      nickname: user.nickname,
      titleId: savedTitle.id,
    };

    const patchUsersDetailRequestDto: PatchUsersDetailRequestDto = {
      imgUrl: patchUsersDetailDto.imgUrl,

      titleId: patchUsersTitleDto.titleId,

      message: patchUsersDetailDto.message,
    };
    //when
    await service.patchUserDetail(patchUsersDetailDto);

    const result = await userTitleRepository.findOne({
      where: { user: { id: user.id }, title: { id: savedTitle.id } },
    });

    expect(result.user.nickname).toBe(user.nickname);
    expect(result.user.imageUrl).toBe(user.imageUrl);
    expect(result.user.level).toBe(user.level);
    expect(result.user.statusMessage).toBe(user.statusMessage);
    expect(result.title.name).toBe(savedTitle.name);
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
      nickname: 'testnick1',
    };
    const getUsersTitlesDto2: GetUserTitlesDto = {
      nickname: 'testnick2',
    };
    const getUsersTitlesDto3: GetUserTitlesDto = {
      nickname: 'testnick3',
    };

    const result1 = await service.getUserTitles(getUsersTitlesDto1);
    const result2 = await service.getUserTitles(getUsersTitlesDto2);
    const result3 = await service.getUserTitles(getUsersTitlesDto3);

    //타이틀의 갯수
    expect(result1.titles.length).toBe(3);
    expect(result2.titles.length).toBe(3);
    expect(result3.titles.length).toBe(3);

    //모든 타이틀의 이름
    expect(result1.titles).toBe([
      savedTitle.name,
      savedTitle2.name,
      savedTitle3.name,
    ]);
    expect(result2.titles).toBe([
      savedTitle.name,
      savedTitle2.name,
      savedTitle3.name,
    ]);
    expect(result3.titles).toBe([
      savedTitle.name,
      savedTitle2.name,
      savedTitle3.name,
    ]);

    //선택된 타이틀의 이름
    expect(result1.selectedTitle).toBe(savedTitle.name);
    expect(result2.selectedTitle).toBe(savedTitle2.name);
    expect(result3.selectedTitle).toBe(savedTitle3.name);
  });
});
