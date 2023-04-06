import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { UsertitleModule } from 'src/user-title/user-title.module';
import { PatchUsersDetailDto } from './dto/patch.users.detail.dto';
import { Title } from 'src/title/title.entity';
import { TitleModule } from 'src/title/title.module';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let titleRepository: Repository<Title>;
  let userTitleRepository: Repository<UserTitle>;
  let dataSources: DataSource;

  beforeAll(async () => {
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

    const patchUserDetailDto: PatchUsersDetailDto = {
      nickname: 'testnick',
      imgUrl: 'testurl',
      titleId: savedTitle.id,
      message: 'testmessage',
    };

    //when
    await service.userDetailByDtoPatch(patchUserDetailDto);

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
