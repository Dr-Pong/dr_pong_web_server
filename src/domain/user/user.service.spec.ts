import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { PatchUserImageDto } from './dto/patch.user.image.dto';
import { TestService } from 'src/test/test.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { TestModule } from 'src/test/test.module';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserDetailDto } from './dto/user.detail.dto';
import { UserModule } from './user.module';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { PostGatewayUserDto } from './dto/post.gateway.users.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;
  let testData: TestService;

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
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testData.createProfileImages();
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
    await testData.createProfileImages();
    const basicUser: User = await testData.createBasicUser();

    const getUserDetailRequest: GetUserDetailDto = {
      nickname: basicUser.nickname,
    };

    const result: UserDetailDto = await service.getUsersDetail(
      getUserDetailRequest,
    );

    expect(result.nickname).toBe(basicUser.nickname);
    expect(result.image.url).toBe(basicUser.image.url);
    expect(result.statusMessage).toBe(basicUser.statusMessage);
    expect(result.level).toBe(basicUser.level);
  });

  it('User Image Patch 테스트', async () => {
    await testData.createProfileImages();
    const basicUser: User = await testData.createBasicUser();

    const patchUserImageRequest: PatchUserImageDto = {
      userId: basicUser.id,
      imageId: testData.profileImages[1].id,
    };

    await service.patchUserImage(patchUserImageRequest);

    const result: User = await userRepository.findOne({
      where: { id: basicUser.id },
    });

    expect(result.id).toBe(patchUserImageRequest.userId);
    expect(result.image.id).toBe(patchUserImageRequest.imageId);
  });

  it('User Message Patch 테스트', async () => {
    await testData.createProfileImages();
    const basicUser: User = await testData.createBasicUser();

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
    await testData.createProfileImages();
    const basicCase = await service.getUserImages();

    expect(basicCase.images.length).toBe(testData.profileImages.length);
    expect(basicCase.images[0].id).toBe(testData.profileImages[0].id);
    expect(basicCase.images[0].url).toBe(testData.profileImages[0].url);
  });

  it('GateWay User 저장 테스트', async () => {
    await testData.createProfileImages();

    const gateWayUser: PostGatewayUserDto = {
      id: 1,
      nickname: 'test',
      imgId: testData.profileImages[0].id,
      imgUrl: testData.profileImages[0].url,
    };

    await service.postGatewayUser(gateWayUser);

    const result: User = await userRepository.findOne({
      where: { id: gateWayUser.id },
    });

    expect(result.id).toBe(gateWayUser.id);
    expect(result.nickname).toBe(gateWayUser.nickname);
    expect(result.image.id).toBe(gateWayUser.imgId);
    expect(result.image.url).toBe(gateWayUser.imgUrl);
  });
});
