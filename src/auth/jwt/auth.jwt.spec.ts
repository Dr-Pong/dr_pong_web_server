import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { User } from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleType } from '../../global/utils/enum.user.roletype';
import { UsersDetailDto } from 'src/user/dto/users.detail.dto';
import { JwtStrategy } from './auth.jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../dto/auth.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let dataSources: DataSource;

  beforeEach(async () => {
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

  afterEach(async () => {
    // afterEach가 없어서 일단 만들었는데 여기가 맞는지 모르겠음
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
        roleType: RoleType.ADMIN,
      },)
      const normalUser = await userRepository.save(
        {
          nickname: 'normal',
          email: 'normal@email',
          imageUrl: 'normal.png',
          level: 1,
          statusMessage: 'heehee',
          roleType: RoleType.USER,
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
    const findedAdmin1 = await jwtStrategy.validate(adminToken);
    const findedNormalUser1 = await jwtStrategy.validate(normalToken);

    expect(findedAdmin1.id).toBe(admin.id);
    expect(findedNormalUser1.id).toBe(normalUser.id);
    expect(findedAdmin1.nickname).toBe(admin.nickname);
    expect(findedNormalUser1.nickname).toBe(normalUser.nickname);
    // expect(findedAdmin1.roleType).toBe(RoleType.ADMIN);
    // expect(findedNormalUser1.roleType).toBe(RoleType.USER);

    //find from memory
    const findedAdmin2 = await jwtStrategy.validate(adminToken);
    const findedNormalUser2 = await jwtStrategy.validate(normalToken);

    expect(findedAdmin2.id).toBe(admin.id);
    expect(findedNormalUser2.id).toBe(normalUser.id);
    expect(findedAdmin2.nickname).toBe(admin.nickname);
    expect(findedNormalUser2.nickname).toBe(normalUser.nickname);
    // expect(findedAdmin2.roleType).toBe(RoleType.ADMIN);
    // expect(findedNormalUser2.roleType).toBe(RoleType.USER);
  });

  it('에러 케이스', async () => {
    const normalUser = await userRepository.save(
      {
        nickname: 'admin',
        email: 'admin@email',
        imageUrl: 'admin.png',
        level: 1,
        statusMessage: 'im admin',
        roleType: RoleType.ADMIN,
      },)
    const npc = await userRepository.save(
      {
        nickname: 'npc',
        email: 'npc@email',
        imageUrl: 'npc.png',
        level: 1,
        statusMessage: 'im npc',
        roleType: RoleType.USER,
      },)

    const notRegisteredUserToken = jwtService.sign({
      id: normalUser.id,
      nickname: '',
      // roleType: normalUser.roleType,
    });
    const invalidUserToken = jwtService.sign({
      id: normalUser.id,
      nickname: 'npc',
      // roleType: normalUser.roleType,
    });
    const invaliedFormetToken = 'wrong token';
    const expiredToken = jwtService.sign({
      id: normalUser.id,
      nickname: normalUser.nickname,
      // roleType: normalUser.roleType,
    }, {expiresIn:0});

    await expect(jwtStrategy.validate(notRegisteredUserToken)).rejects.toThrow(new UnauthorizedException('nickname required'));
    await expect(jwtStrategy.validate(invalidUserToken)).rejects.toThrow(new UnauthorizedException('invalid token'));
    await expect(jwtStrategy.validate(invaliedFormetToken)).rejects.toThrow(new UnauthorizedException('invalid token'));
    await expect(jwtStrategy.validate(expiredToken)).rejects.toThrow(new UnauthorizedException('jwt expired'));
  });
});
