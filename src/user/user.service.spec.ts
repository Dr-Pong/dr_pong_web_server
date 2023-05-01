import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { PatchUserDetailDto } from './dto/patch.user.detail.dto';
import { TestService } from 'src/test/test.service';
import { GetUserDetailDto } from './dto/get.user.detail.dto';
import { TestModule } from 'src/test/test.module';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserDetailDto } from './dto/user.detail.dto';
import { UserModule } from './user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ROLETYPE_GUEST, ROLETYPE_MEMBER, ROLETYPE_NONAME } from 'src/global/type/type.user.roletype';
import { GetUserMeDto } from './dto/get.user.me.dto';
import { AuthModule } from 'src/auth/auth.module';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;
  let testData: TestService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeORMConfig),
        UserModule,
        TestModule,
      ],
      providers: [
        JwtService,
        UserService,
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
    jwtService = module.get<JwtService>(JwtService);
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

  it('User Me Get Service 테스트', async () => {
    const basicUser: User = await testData.createBasicUser();

    const validToken: string = jwtService.sign({
      id:basicUser.id,
      nickname:basicUser.nickname,
      roleType:basicUser.roleType,
    });

    const nonameToken: string = jwtService.sign({
      id: null,
      nickname: '',
      roleType: ROLETYPE_NONAME,
    });

    const basicDto: GetUserMeDto = {
      token: validToken,
    };

    const nonameDto: GetUserMeDto = {
      token: nonameToken,
    };

    const guestDto: GetUserMeDto = {
      token: null,
    };

    const basicCase = await service.getUserMe(basicDto);
    const nonameCase = await service.getUserMe(nonameDto);
    const guestCase = await service.getUserMe(guestDto);

    expect(basicCase.nickname).toBe(basicUser.nickname);
    expect(basicCase.imgUrl).toBe(basicUser.imageUrl);
    expect(basicCase.isSecondAuthOn).toBe(false);
    expect(basicCase.roleType).toBe(ROLETYPE_MEMBER);
    
    expect(nonameCase.nickname).toBe('');
    expect(nonameCase.imgUrl).toBe('');
    expect(nonameCase.isSecondAuthOn).toBe(false);
    expect(nonameCase.roleType).toBe(ROLETYPE_NONAME);

    expect(guestCase.nickname).toBe('');
    expect(guestCase.imgUrl).toBe('');
    expect(guestCase.isSecondAuthOn).toBe(false);
    expect(guestCase.roleType).toBe(ROLETYPE_GUEST);
  });

  it('User Image Get Service 테스트', async () => {
    await testData.createImages();
    const basicUser: User = await testData.createBasicUser();

    const basicCase = await service.getUserImages(basicDto);

    expect(basicCase.length).toBe(testData.images.length);
    expect(basicCase.images[0].id).toBe(testData.images[0].id);
    expect(basicCase.images[0].url).toBe(testData.images[0].imageUrl);
  });
});
