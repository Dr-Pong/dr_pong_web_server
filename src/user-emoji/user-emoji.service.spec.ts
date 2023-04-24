import { Test, TestingModule } from '@nestjs/testing';
import { UserEmojiService } from './user-emoji.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Emoji } from 'src/emoji/emoji.entity';
import { UserEmoji } from './user-emoji.entity';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { UserModule } from 'src/user/user.module';
import { EmojiModule } from 'src/emoji/emoji.module';
import { UserEmojiModule } from './user-emoji.module';
import { async } from 'rxjs';
import { GetUserEmojisDto } from './dto/get.user.emojis.dto';
import { PatchUserEmojisDto } from './dto/patch.user.emojis.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserEmojiService', () => {
  let service: UserEmojiService;
  let userRepository: Repository<User>;
  let emojiRepository: Repository<Emoji>;
  let userEmojiRepository: Repository<UserEmoji>;
  let dataSources: DataSource;
  let users: User[];
  let emojis: Emoji[];

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

    emojis = await emojiRepository.save([
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
      {
        name: 'emoji6',
        imageUrl: 'emojiImageUrl6',
      },
      {
        name: 'emoji7',
        imageUrl: 'emojiImageUrl7',
      },
      {
        name: 'emoji8',
        imageUrl: 'emojiImageUrl8',
      },
      {
        name: 'emoji9',
        imageUrl: 'emojiImageUrl9',
      },
    ]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 이모지 전체 Get(false요청)', async () => {
    //given
    await userEmojiRepository.save([
      {
        user: users[0],
        emoji: emojis[0],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojis[1],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojis[2],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojis[3],
        isSelected: false,
      },
      {
        user: users[1],
        emoji: emojis[0],
        isSelected: false,
      },
    ]);

    //user[0]친구가 : selected와 acheieved, unacheieved가 전부 있음
    const getDto1: GetUserEmojisDto = {
      userId: users[0].id,
      isSelected: false,
    };
    //user[1]친구가 : selected가 없는상태
    const getDto2: GetUserEmojisDto = {
      userId: users[1].id,
      isSelected: false,
    };
    //user[2]친구가: achieved도 없는상태
    const getDto3: GetUserEmojisDto = {
      userId: users[2].id,
      isSelected: false,
    };
    //없는 유저에 대해서 접근하는 테스트 코드가 필요하다 언제? getUserDetail이 로그인이구현되는 그때

    //When
    const user0Allemojis = await service.getUseremojis(getDto1);
    const user1Allemojis = await service.getUseremojis(getDto2);
    const user2Allemojis = await service.getUseremojis(getDto3);

    //then
    expect(user0Allemojis.emojis.length).toBe(emojis.length);
    expect(user0Allemojis.emojis[0].status).toBe('selected');
    expect(user0Allemojis.emojis[1].status).toBe('selected');
    expect(user0Allemojis.emojis[2].status).toBe('selected');
    expect(user0Allemojis.emojis[3].status).toBe('achieved');
    expect(user0Allemojis.emojis[4].status).toBe('unachieved');

    expect(user1Allemojis.emojis.length).toBe(emojis.length);
    expect(user1Allemojis.emojis[0].status).toBe('achieved');
    expect(user1Allemojis.emojis[1].status).toBe('unachieved');
    expect(user1Allemojis.emojis[2].status).toBe('unachieved');
    expect(user1Allemojis.emojis[3].status).toBe('unachieved');
    expect(user1Allemojis.emojis[4].status).toBe('unachieved');

    expect(user2Allemojis.emojis.length).toBe(emojis.length);
    expect(user2Allemojis.emojis[0].status).toBe('unachieved');
    expect(user2Allemojis.emojis[1].status).toBe('unachieved');
    expect(user2Allemojis.emojis[2].status).toBe('unachieved');
    expect(user2Allemojis.emojis[3].status).toBe('unachieved');
    expect(user2Allemojis.emojis[4].status).toBe('unachieved');
  });

  it('유저 선택 이모지 Get (true요청)', async () => {
    //given
    await userEmojiRepository.save([
      {
        user: users[0],
        emoji: emojis[0],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojis[1],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojis[2],
        isSelected: true,
      },
      {
        user: users[0],
        emoji: emojis[3],
        isSelected: true,
      },
      {
        user: users[1],
        emoji: emojis[3],
        isSelected: true,
      },
    ]);

    //when

    //user0 이 4개의 seleted emojis가지고 있는경우
    const getDto1: GetUserEmojisDto = {
      userId: users[0].id,
      isSelected: true,
    };
    //user1 이 1개([3]번째) 의 selected emoji 를 가지고 있는경우
    const getDto2: GetUserEmojisDto = {
      userId: users[1].id,
      isSelected: true,
    };

    //user2 가 selected가 없는 상태
    const getDto3: GetUserEmojisDto = {
      userId: users[2].id,
      isSelected: true,
    };

    //마찬가지로 없는유저에 대한 접근할때 테스트 요청과 없는 이모지에 대한 요청테스트코드를 만들것

    const user0SelectedEmojis = await service.getUseremojis(getDto1);
    const user1SelectedEmojis = await service.getUseremojis(getDto2);
    const user2SelectedEmojis = await service.getUseremojis(getDto3);

    //then
    expect(user0SelectedEmojis.emojis.length).toBe(4);
    expect(user1SelectedEmojis.emojis.length).toBe(1);
    expect(user2SelectedEmojis.emojis.length).toBe(0);

    expect(user0SelectedEmojis.emojis[0].name).toBe(emojis[0].name);
    expect(user0SelectedEmojis.emojis[1].name).toBe(emojis[1].name);
    expect(user0SelectedEmojis.emojis[2].name).toBe(emojis[2].name);
    expect(user0SelectedEmojis.emojis[3].name).toBe(emojis[3].name);

    expect(user1SelectedEmojis.emojis[0].name).toBe(emojis[3].name);
  });

  it('유저 이모지 Patch (false/ true 요청을 true로 변환)', async () => {
    //get
    await userEmojiRepository.save([
      {
        user: users[0],
        emoji: emojis[0],
        isSelected: false,
      },
      {
        user: users[0],
        emoji: emojis[1],
        isSelected: false,
      },
      {
        user: users[0],
        emoji: emojis[2],
        isSelected: false,
      },
      {
        user: users[0],
        emoji: emojis[3],
        isSelected: false,
      },
      {
        //user 0 이 true로 가지고 있던 이모찌4
        user: users[0],
        emoji: emojis[4],
        isSelected: true,
      },
      {
        user: users[1],
        emoji: emojis[0],
        isSelected: true,
      },
      {
        user: users[1],
        emoji: emojis[1],
        isSelected: false,
      },
      {
        user: users[1],
        emoji: emojis[2],
        isSelected: true,
      },
    ]);

    // isSelected가 다 false인경우
    const validUpdateDto1: PatchUserEmojisDto = {
      userId: users[0].id,
      emojisId: [emojis[0].id, emojis[1].id, emojis[2].id, emojis[3].id],
    };
    //isSelected가 false와 true가 섞여서 온경우
    const validUpdateDto2: PatchUserEmojisDto = {
      userId: users[1].id,
      emojisId: [emojis[0].id, emojis[1].id, emojis[2].id],
    };
    //일부 없는 emoji에 접근
    const invalidUpdateDto1: PatchUserEmojisDto = {
      userId: users[2].id,
      emojisId: [emojis[1].id, emojis[2].id, emojis[5].id],
    };
    //전부 없는 emoji에 접근
    const invalidUpdateDto2: PatchUserEmojisDto = {
      userId: users[2].id,
      emojisId: [emojis[6].id, emojis[7].id, emojis[8].id],
    };

    //when
    //validUpdateDto1 에대한 실행
    await service.patchUseremojis(validUpdateDto1);
    //validUpdateDto2 에대한 실행
    await service.patchUseremojis(validUpdateDto2);

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
    await expect(service.patchUseremojis(invalidUpdateDto1)).rejects.toThrow(
      new BadRequestException('No such emojis'),
    );
    //invalidUpateDto2 에대한실행
    await expect(service.patchUseremojis(invalidUpdateDto2)).rejects.toThrow(
      new BadRequestException('No such emojis'),
    );
  });
});
