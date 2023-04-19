import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleType } from './enum.user.roletype';
import { UsersDetailDto } from 'src/user/dto/users.detail.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthService, {
        provide: getRepositoryToken(User),
        useClass: Repository,
      }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

  });

  it('should be defined', async () => {
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
  
    
    //find from DB
    const findedAdmin1 = await service.getAuthUserByNickname(admin.nickname);
    const findedNormalUser1 = await service.getAuthUserByNickname(normalUser.nickname);

    expect(findedAdmin1).toBe(UsersDetailDto);
    expect(findedNormalUser1).toBe(UsersDetailDto);
    expect(findedAdmin1.id).toBe(admin.id);
    expect(findedNormalUser1.id).toBe(normalUser.id);
    expect(findedAdmin1.nickname).toBe(admin.nickname);
    expect(findedNormalUser1.nickname).toBe(normalUser.nickname);
    // expect(findedAdmin1.roleType).toBe(RoleType.ADMIN);
    // expect(findedNormalUser1.roleType).toBe(RoleType.USER);

    //find from memory
    const findedAdmin2 = await service.getAuthUserByNickname(admin.nickname);
    const findedNormalUser2 = await service.getAuthUserByNickname(normalUser.nickname);

    expect(findedAdmin2).toBe(UsersDetailDto);
    expect(findedNormalUser2).toBe(UsersDetailDto);
    expect(findedAdmin2.id).toBe(admin.id);
    expect(findedNormalUser2.id).toBe(normalUser.id);
    expect(findedAdmin2.nickname).toBe(admin.nickname);
    expect(findedNormalUser2.nickname).toBe(normalUser.nickname);
    // expect(findedAdmin2.roleType).toBe(RoleType.ADMIN);
    // expect(findedNormalUser2.roleType).toBe(RoleType.USER);
  });
});
