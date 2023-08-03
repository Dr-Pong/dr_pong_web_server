import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { TestService } from 'src/test/data/test.service';
import { TestModule } from 'src/test/data/test.module';
import { typeORMConfig } from 'src/configs/typeorm.config';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { UserService } from 'src/domain/user/user.service';
import { User } from 'src/domain/user/user.entity';
import { UserModule } from 'src/domain/user/user.module';
import { GetUserDetailDto } from 'src/domain/user/dto/get.user.detail.dto';
import { UserDetailDto } from 'src/domain/user/dto/user.detail.dto';
import { PatchUserImageDto } from 'src/domain/user/dto/patch.user.image.dto';
import { PatchUserMessageDto } from 'src/domain/user/dto/patch.user.message.dto';
import { PostGatewayUserDto } from 'src/domain/user/dto/post.gateway.users.dto';
import { UserTestService } from 'src/test/data/user.test.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;
  let testData: TestService;
  let userTestData: UserTestService;

  beforeAll(async () => {
    initializeTransactionalContext();
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
            return addTransactionalDataSource({
              dataSource: new DataSource(options),
            });
          },
        }),
        UserModule,
        TestModule,
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
    userTestData = module.get<UserTestService>(UserTestService);
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await userTestData.createProfileImages();
  });

  afterEach(async () => {
    testData.clear();
    service.users.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('User Detail Get 정보 테스트 ', async () => {
    await userTestData.createProfileImages();
    const basicUser: User = await userTestData.createBasicUser();

    const getUserDetailRequest: GetUserDetailDto = {
      nickname: basicUser.nickname,
    };

    const result: UserDetailDto = await service.getUsersDetail(
      getUserDetailRequest,
    );

    expect(result.nickname).toBe(basicUser.nickname);
    expect(result.image.url).toBe(basicUser.image.url);
    expect(result.statusMessage).toBe(basicUser.statusMessage);
  });

  it('User Image Patch 테스트', async () => {
    await userTestData.createProfileImages();
    const basicUser: User = await userTestData.createBasicUser();

    const patchUserImageRequest: PatchUserImageDto = {
      userId: basicUser.id,
      imageId: userTestData.profileImages[1].id,
    };

    await service.patchUserImage(patchUserImageRequest);

    const result: User = await userRepository.findOne({
      where: { id: basicUser.id },
    });

    expect(result.id).toBe(patchUserImageRequest.userId);
    expect(result.image.id).toBe(patchUserImageRequest.imageId);
  });

  it('User Message Patch 테스트', async () => {
    await userTestData.createProfileImages();
    const basicUser: User = await userTestData.createBasicUser();

    const patchUserMessageRequest: PatchUserMessageDto = {
      userId: basicUser.id,
      message: 'changedMessage',
    };

    await service.patchUserStatusMessage(patchUserMessageRequest);

    const result: User = await userRepository.findOne({
      where: { id: basicUser.id },
    });

    expect(result.id).toBe(patchUserMessageRequest.userId);
    expect(result.statusMessage).toBe(patchUserMessageRequest.message);
  });

  it('User Image Get Service 테스트', async () => {
    await userTestData.createProfileImages();
    const basicCase = await service.getUserImages();

    expect(basicCase.images[0].id).toBe(userTestData.profileImages[0].id);
    expect(basicCase.images[0].url).toBe(userTestData.profileImages[0].url);
  });

  it('GateWay User 저장 테스트', async () => {
    await userTestData.createProfileImages();
    await testData.createBasicSeasons(1);

    const gateWayUser: PostGatewayUserDto = {
      id: 1,
      nickname: 'test',
      imgId: userTestData.profileImages[0].id,
      imgUrl: userTestData.profileImages[0].url,
    };

    await service.postUser(gateWayUser);

    const result: User = await userRepository.findOne({
      where: { id: gateWayUser.id },
    });

    expect(result.id).toBe(gateWayUser.id);
    expect(result.nickname).toBe(gateWayUser.nickname);
    expect(result.image.id).toBe(gateWayUser.imgId);
    expect(result.image.url).toBe(gateWayUser.imgUrl);
  });
});
