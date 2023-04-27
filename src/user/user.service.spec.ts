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
import { PatchUserTitleDto } from '../user-title/dto/patch.user.title.dto';
import { PatchUsersDetailRequestDto } from './dto/patch.users.detail.request.dto';
import { GetUserSelectedTitleDto } from './dto/get.user.selected.title.dto';
import exp from 'constants';
import { async } from 'rxjs';
import { GetUserTitlesDto } from 'src/user-title/dto/get.user.titles.dto';
import { AppModule } from 'src/app.module';
import { TestService } from 'src/test/test.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UserDetailDto } from './dto/user.detail.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;
  let testData: TestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSources = module.get<DataSource>(DataSource);
    testData = module.get<TestService>(TestService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('User Detail Get 정보 테스트 ', async () => {
    const basicUser: User = await testData.createBasicUser();

    const getUserDetailRequest: GetUserDetailDto = {
      nickname: basicUser.nickname,
    };

    const result: UserDetailDto = await service.getUsersDetail(
      getUserDetailRequest,
    );

    expect(result.nickname).toBe(basicUser.nickname);
    expect(result.imgUrl).toBe(basicUser.imageUrl);
    expect(result.statusMessage).toBe(basicUser.statusMessage);
    expect(result.level).toBe(basicUser.level);
  });

  it('User Detail Patch 테스트', async () => {});
});
