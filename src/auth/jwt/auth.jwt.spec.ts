import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/domain/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ROLETYPE_ADMIN, ROLETYPE_MEMBER, ROLETYPE_NONAME } from '../../global/type/type.user.roletype';
import { JwtStrategy } from './auth.jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        JwtService,
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSources = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('정상 작동 케이스', async () => {
    const admin = await userRepository.save(
      {
        nickname: 'admin',
        email: 'admin@email',
        imageUrl: 'admin.png',
        level: 1,
        statusMessage: 'im admin',
        roleType: 'admin',
      },)
    const normalUser = await userRepository.save(
      {
        nickname: 'normal',
        email: 'normal@email',
        imageUrl: 'normal.png',
        level: 1,
        statusMessage: 'heehee',
        roleType: 'member',
      },)

    const adminToken = jwtService.sign({
      id: admin.id,
      nickname: admin.nickname,
      roleType: admin.roleType,
    });
    const normalToken = jwtService.sign({
      id: normalUser.id,
      nickname: normalUser.nickname,
      roleType: normalUser.roleType,
    });

    //find from DB
    const findedAdmin1 = await jwtStrategy.validate(jwtService.verify(adminToken));
    const findedNormalUser1 = await jwtStrategy.validate(jwtService.verify(normalToken));

    expect(findedAdmin1.id).toBe(admin.id);
    expect(findedNormalUser1.id).toBe(normalUser.id);
    expect(findedAdmin1.nickname).toBe(admin.nickname);
    expect(findedNormalUser1.nickname).toBe(normalUser.nickname);
    expect(findedAdmin1.roleType).toBe(ROLETYPE_ADMIN);
    expect(findedNormalUser1.roleType).toBe(ROLETYPE_MEMBER);

    //find from memory
    const findedAdmin2 = await jwtStrategy.validate(jwtService.verify(adminToken));
    const findedNormalUser2 = await jwtStrategy.validate(jwtService.verify(normalToken));

    expect(findedAdmin2.id).toBe(admin.id);
    expect(findedNormalUser2.id).toBe(normalUser.id);
    expect(findedAdmin2.nickname).toBe(admin.nickname);
    expect(findedNormalUser2.nickname).toBe(normalUser.nickname);
    expect(findedAdmin2.roleType).toBe(ROLETYPE_ADMIN);
    expect(findedNormalUser2.roleType).toBe(ROLETYPE_MEMBER);
  });

  it('에러 케이스', async () => {
    const normalUser = await userRepository.save(
      {
        nickname: 'normal',
        email: 'normal@email',
        imageUrl: 'normal.png',
        level: 1,
        statusMessage: 'im normal',
        roleType: 'member',
      },)
    const npc = await userRepository.save(
      {
        nickname: 'npc',
        email: 'npc@email',
        imageUrl: 'npc.png',
        level: 1,
        statusMessage: 'im npc',
        roleType: 'member',
      },)
    const noNickNameUserToken = jwtService.sign({
      id: null,
      nickname: '',
      roleType: ROLETYPE_NONAME,
    })

    const notRegisteredUserToken = jwtService.sign({
      id: -1,
      nickname: 'not Rejistered',
      roleType: normalUser.roleType,
    });
    const invalidUserToken = jwtService.sign({
      id: normalUser.id,
      nickname: 'npc',
      roleType: normalUser.roleType,
    });
    const invaliedFormetToken = 'wrong token';
    const expiredToken = jwtService.sign({
      id: normalUser.id,
      nickname: normalUser.nickname,
      roleType: normalUser.roleType,
    }, { expiresIn: 0 });

    await expect(jwtStrategy.validate(jwtService.verify(notRegisteredUserToken))).rejects.toThrow(new UnauthorizedException());
    await expect(jwtStrategy.validate(jwtService.verify(invalidUserToken))).rejects.toThrow(new UnauthorizedException('invalid token'));
    await expect(jwtStrategy.validate(jwtService.verify(noNickNameUserToken))).rejects.toThrow(new UnauthorizedException());
    // await expect(jwtStrategy.validate(jwtService.verify(invaliedFormetToken))).rejects.toThrow();
    // await expect(jwtStrategy.validate(jwtService.verify(expiredToken))).rejects.toThrow(new UnauthorizedException()); // error cases
  });
});
