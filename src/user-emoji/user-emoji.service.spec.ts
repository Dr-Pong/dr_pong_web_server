import { Test, TestingModule } from '@nestjs/testing';
import { UserEmojiService } from './user-emoji.service';
import { DataSource, Repository, RepositoryNotTreeError } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { UserEmoji } from './user-emoji.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserModule } from 'src/user/user.module';
import { EmojiModule } from 'src/emoji/emoji.module';
import { UserEmojiModule } from './user-emoji.module';
import { async } from 'rxjs';
import { GetUserEmojiesDto } from './dto/get.user.emojies.dto';
import { PatchUserEmojiesDto } from './dto/patch.user.emojies.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserEmojiService', () => {
  let service: UserEmojiService;
  let userRepository: Repository<User>;
  let emojiRepository: Repository<Emoji>;
  let userEmojiRepository: Repository<UserEmoji>;
  let dataSources: DataSource;
  let users: User[];
  let emojies: Emoji[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeORMConfig),
        UserModule,
        EmojiModule,
        UserEmojiModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Emoji),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEmoji),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserEmojiService>(UserEmojiService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emojiRepository = module.get<Repository<Emoji>>(getRepositoryToken(Emoji));
    userEmojiRepository = module.get<Repository<UserEmoji>>(
      getRepositoryToken(UserEmoji),
    );
    dataSources = module.get<DataSource>(DataSource);

    //미리 유저 3개 저장
    users = await userRepository.save([
      {
        nickname: 'testnick1',
        email: 'testemail1',
        imageUrl: 'testurl1',
        level: 1,
        statusMessage: 'testmessage1',
      },
      {
        nickname: 'testnick2',
        email: 'testemail2',
        imageUrl: 'testurl2',
        level: 2,
        statusMessage: 'testmessage2',
      },
      {
        nickname: 'testnick3',
        email: 'testemail3',
        imageUrl: 'testurl3',
        level: 3,
        statusMessage: 'testmessage3',
      },
    ]);

    emojies = await emojiRepository.save([
      {
        name: 'emoji1',
        imageUrl: 'emojiImageUrl1',
      },
      {
        name: 'emoji2',
        imageUrl: 'emojiImageUrl2',
      },
      {
        name: 'emoji3',
        imageUrl: 'emojiImageUrl3',
      },
      {
        name: 'emoji4',
        imageUrl: 'emojiImageUrl4',
      },
      {
        name: 'emoji5',
        imageUrl: 'emojiImageUrl5',
      },
    ]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 이모지 전체 조회 (false요청)', async () => {
    //given
    await userEmojiRepository.save([
      {
        user: users[0],
        emoji: emojies[0],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojies[1],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojies[2],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojies[3],
        isSelected: false,
      },
      {
        user: users[1],
        emoji: emojies[0],
        isSelected: false,
      },
    ]);

    //user[0]친구가 : selected와 acheieved, unacheieved가 전부 있음
    const getDto1: GetUserEmojiesDto = {
      userId: users[0].id,
      isSelected: false,
    };
    //user[1]친구가 : selected가 없는상태
    const getDto2: GetUserEmojiesDto = {
      userId: users[1].id,
      isSelected: false,
    };
    //user[2]친구가: achieved도 없는상태
    const getDto3: GetUserEmojiesDto = {
      userId: users[2].id,
      isSelected: false,
    };
    //없는 유저에 대해서 접근하는 테스트 코드가 필요하다 언제? getUserDetail이 로그인이구현되는 그때

    //When
    const user0AllEmojies = await service.getUserEmojies(getDto1);
    const user1AllEmojies = await service.getUserEmojies(getDto2);
    const user2AllEmojies = await service.getUserEmojies(getDto3);

    //then
    expect(user0AllEmojies.emojies.length).toBe(emojies.length);
    expect(user0AllEmojies.emojies[0].status).toBe('selected');
    expect(user0AllEmojies.emojies[1].status).toBe('selected');
    expect(user0AllEmojies.emojies[2].status).toBe('selected');
    expect(user0AllEmojies.emojies[3].status).toBe('achieved');
    expect(user0AllEmojies.emojies[4].status).toBe('unachieved');

    expect(user1AllEmojies.emojies.length).toBe(emojies.length);
    expect(user1AllEmojies.emojies[0].status).toBe('achieved');
    expect(user1AllEmojies.emojies[1].status).toBe('unachieved');
    expect(user1AllEmojies.emojies[2].status).toBe('unachieved');
    expect(user1AllEmojies.emojies[3].status).toBe('unachieved');
    expect(user1AllEmojies.emojies[4].status).toBe('unachieved');

    expect(user2AllEmojies.emojies.length).toBe(emojies.length);
    expect(user2AllEmojies.emojies[0].status).toBe('unachieved');
    expect(user2AllEmojies.emojies[1].status).toBe('unachieved');
    expect(user2AllEmojies.emojies[2].status).toBe('unachieved');
    expect(user2AllEmojies.emojies[3].status).toBe('unachieved');
    expect(user2AllEmojies.emojies[4].status).toBe('unachieved');
  });

  it('유저 선택 이모지 조회 (true요청)', async () => {
    //given
    await userEmojiRepository.save([
      {
        user: users[0],
        emoji: emojies[0],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojies[1],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojies[2],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojies[3],
        isSelected: true,
      },
      {
        user: users[1],
        emoji: emojies[3],
        isSelected: true,
      },
    ]);

    //when

    //user0 이 4개의 seleted emojies가지고 있는경우
    const getDto1: GetUserEmojiesDto = {
      userId: users[0].id,
      isSelected: true,
    };
    //user1 이 1개([3]번째) 의 selected emoji 를 가지고 있는경우
    const getDto2: GetUserEmojiesDto = {
      userId: users[1].id,
      isSelected: true,
    };

    //user2 가 selected가 없는 상태
    const getDto3: GetUserEmojiesDto = {
      userId: users[2].id,
      isSelected: true,
    };

    //마찬가지로 없는유저에 대한 접근할때 테스트 요청과 없는 이모지에 대한 요청테스트코드를 만들것

    const user0SelectedEmojis = await service.getUserEmojies(getDto1);
    const user1SelectedEmojis = await service.getUserEmojies(getDto2);
    const user2SelectedEmojis = await service.getUserEmojies(getDto3);

    //then
    expect(user0SelectedEmojis.emojies.length).toBe(4);
    expect(user1SelectedEmojis.emojies.length).toBe(1);
    expect(user2SelectedEmojis.emojies.length).toBe(0);

    expect(user0SelectedEmojis.emojies[0].name).toBe(emojies[0].name);
    expect(user0SelectedEmojis.emojies[1].name).toBe(emojies[1].name);
    expect(user0SelectedEmojis.emojies[2].name).toBe(emojies[2].name);
    expect(user0SelectedEmojis.emojies[3].name).toBe(emojies[3].name);

    expect(user1SelectedEmojis.emojies[3].name).toBe(emojies[3].name);
  });

  it('유저 이모지 수정 (false/ true 요청을 true로 변환)', async () => {
    //get
    await userEmojiRepository.save([
      {
        user: users[0],
        emoji: emojies[0],
        isSelected: false,
      },
      {
        user: users[0],
        emoji: emojies[1],
        isSelected: false,
      },
      {
        user: users[0],
        emoji: emojies[2],
        isSelected: false,
      },
      {
        user: users[0],
        emoji: emojies[3],
        isSelected: false,
      },
      {
        //user 0 이 true로 가지고 있던 이모찌4
        user: users[0],
        emoji: emojies[4],
        isSelected: true,
      },
      {
        user: users[1],
        emoji: emojies[0],
        isSelected: true,
      },
      {
        user: users[1],
        emoji: emojies[1],
        isSelected: false,
      },
      {
        user: users[1],
        emoji: emojies[2],
        isSelected: true,
      },
    ]);

    // isSelected가 다 false인경우
    const validUpdateDto1: PatchUserEmojiesDto = {
      userId: users[0].id,
      emojiesId: [emojies[0].id, emojies[1].id, emojies[2].id, emojies[3].id],
    };
    //isSelected가 false와 true가 섞여서 온경우
    const validUpdateDto2: PatchUserEmojiesDto = {
      userId: users[1].id,
      emojiesId: [emojies[0].id, emojies[1].id, emojies[2].id],
    };
    //일부 없는 emoji에 접근
    const invalidUpdateDto1: PatchUserEmojiesDto = {
      userId: users[2].id,
      emojiesId: [emojies[1].id, emojies[2].id, emojies[6].id],
    };
    //전부 없는 emoji에 접근
    const invalidUpdateDto2: PatchUserEmojiesDto = {
      userId: users[2].id,
      emojiesId: [emojies[6].id, emojies[7].id, emojies[8].id],
    };

    //when
    //validUpdateDto1 에대한 실행
    await service.patchUserEmojies(validUpdateDto1);
    //validUpdateDto2 에대한 실행
    await service.patchUserEmojies(validUpdateDto2);

    const resutls1 = await userEmojiRepository.find({
      where: { user: { id: users[0].id } },
    });
    const resutls2 = await userEmojiRepository.find({
      where: { user: { id: users[1].id } },
    });

    expect(resutls1[0].isSelected).toBe(true);
    expect(resutls1[1].isSelected).toBe(true);
    expect(resutls1[2].isSelected).toBe(true);
    expect(resutls1[3].isSelected).toBe(true);
    expect(resutls1[4].isSelected).toBe(false); //실행후 emoji4가 false로 바뀌어있는지 확인 하는 부분

    expect(resutls2[0].isSelected).toBe(true);
    expect(resutls2[1].isSelected).toBe(true);
    expect(resutls2[2].isSelected).toBe(true);

    //invalidUpateDto1 에대한실행
    await expect(service.patchUserEmojies(invalidUpdateDto1)).rejects.toThrow(
      new BadRequestException('No such Emojies'),
    );
    //invalidUpateDto2 에대한실행
    await expect(service.patchUserEmojies(invalidUpdateDto2)).rejects.toThrow(
      new BadRequestException('No such Emojies'),
    );
  });
});
