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

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let userTitleRepository: Repository<UserTitle>;
  let dataSources: DataSource;

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

  it('get user selected title ', async () => {
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

  it('should be defined', async () => {
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
});
