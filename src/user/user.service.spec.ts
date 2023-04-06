import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserTitle } from 'src/user-title/user-title.entity';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let userTitleRepository: Repository<UserTitle>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeORMConfig),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([UserTitle]),
      ],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', async () => {
    const user = new User();
    user.nickname = 'test';
    user.email = 'testemail';
    user.imageUrl = 'testurl';
    user.level = 1;
    user.statusMessage = 'testmessage';
    userRepository.save(user);

    const result = await service.userDetailByNicknameGet('test');

    expect(result.nickname).toBe(user.nickname);
    expect(result.imgUrl).toBe(user.imageUrl);
    expect(result.level).toBe(user.level);
    expect(result.statusMessage).toBe(user.statusMessage);
    expect(result.title).toBe(null);
  });
});
