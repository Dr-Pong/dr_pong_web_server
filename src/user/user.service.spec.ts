import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { AppModule } from 'src/app.module';
import { TestService } from 'src/test/test.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { UsersDetailDto } from './dto/users.detail.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;
  let testData: TestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
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
    }

    const result: UsersDetailDto = await service.getUsersDetail(getUserDetailRequest);

    expect(result.nickname).toBe(basicUser.nickname);
    expect(result.imgUrl).toBe(basicUser.imageUrl);
    expect(result.statusMessage).toBe(basicUser.statusMessage);
    expect(result.level).toBe(basicUser.level);
  });

  it('User Detail Patch 테스트', async () => {
    const basicUser: User = await testData.createBasicUser();

    const patchUserDetailRequest: PatchUserDetailDto = {
      nickname: basicUser.nickname,
      imgUrl: 'changedImageUrl',
      statusMessage: 'change message',
    }

    await service.patchUserDetail(patchUserDetailRequest);

    const result: User = await userRepository.findOne({where:{id:basicUser.id}});

    expect(result.nickname).toBe(patchUserDetailRequest.nickname);
    expect(result.imageUrl).toBe(patchUserDetailRequest.imgUrl);
    expect(result.statusMessage).toBe(patchUserDetailRequest.statusMessage);
  });
});
