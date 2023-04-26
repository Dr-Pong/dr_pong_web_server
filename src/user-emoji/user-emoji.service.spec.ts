import { Test, TestingModule } from '@nestjs/testing';
import { UserEmojiService } from './user-emoji.service';
import { DataSource, Repository } from 'typeorm';
import { GetUserEmojisDto } from './dto/get.user.emojis.dto';
import { PatchUserEmojisDto } from './dto/patch.user.emojis.dto';
import { BadRequestException } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { TestService } from 'src/test/test.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEmoji } from './user-emoji.entity';

describe('UserEmojiService', () => {
  let service: UserEmojiService;
  let testData: TestService;
  let dataSources: DataSource;
  let userEmojiRepository: Repository<UserEmoji>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
      providers:[
        {
          provide: getRepositoryToken(UserEmoji),
          useClass: Repository,
        },
      ]
    }).compile();

    userEmojiRepository = module.get<Repository<UserEmoji>>(getRepositoryToken(UserEmoji));
    service = module.get<UserEmojiService>(UserEmojiService);
    testData = module.get<TestService>(TestService);
    dataSources = module.get<DataSource>(DataSource);

    await testData.createBasicCollectable();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 이모지 전체 Get(false요청, valid case)', async () => {
    //given
    //false로 들어온 경우
    const emojiSelectedWithUser = await testData.createUserWithCollectables();
    const nonEmojiSelectedWithUser = await testData.createUserWithUnSelectedEmojis();
    const userWithOutEmoji = await testData.createBasicUser();

    //user[0]친구가 : selected와 acheieved, unacheieved가 전부 있음
    const mixedRequest: GetUserEmojisDto = {
      userId: emojiSelectedWithUser.id,
      isSelected: false,
    };
    //user[1]친구가 : selected가 없는상태
    const unSelectedRequest: GetUserEmojisDto = {
      userId: nonEmojiSelectedWithUser.id,
      isSelected: false,
    };
    //user[2]친구가: achieved도 없는상태
    const noEmojiRequest: GetUserEmojisDto = {
      userId: userWithOutEmoji.id,
      isSelected: false,
    };
    //없는 유저에 대해서 접근하는 테스트 코드가 필요하다 언제? getUserDetail이 로그인이구현되는 그때

    //When
    const selectedCase = await service.getUseremojis(mixedRequest);
    const nonSelectedCase = await service.getUseremojis(unSelectedRequest);
    const noEmojiCase = await service.getUseremojis(noEmojiRequest);

    //then
    expect(selectedCase.emojis.length).toBe(testData.emojis.length);
    expect(selectedCase.emojis.some(item => item.status === "selected")).toBe(true);
    expect(selectedCase.emojis.some(item => item.status === "achieved")).toBe(true);
    expect(selectedCase.emojis.some(item => item.status === "unachieved")).toBe(true);
    expect(nonSelectedCase.emojis.length).toBe(testData.emojis.length);
    expect(nonSelectedCase.emojis.some(item => item.status === "selected")).toBe(false);
    expect(nonSelectedCase.emojis.some(item => item.status === "achieved")).toBe(true);
    expect(nonSelectedCase.emojis.some(item => item.status === "unachieved")).toBe(true);
    expect(noEmojiCase.emojis.length).toBe(testData.emojis.length);
    expect(noEmojiCase.emojis.some(item => item.status === "selected")).toBe(false);
    expect(noEmojiCase.emojis.some(item => item.status === "achieved")).toBe(false);
    expect(noEmojiCase.emojis.some(item => item.status === "unachieved")).toBe(true);
 });

  it('유저 선택 이모지 Get (true요청)', async () => {
    //given
    const emojiSelectedWithUser = await testData.createUserWithCollectables();
    const nonEmojiSelectedWithUser = await testData.createUserWithUnSelectedEmojis();
    const userWithOutEmoji = await testData.createBasicUser();

    //when

    const selectedRequest: GetUserEmojisDto = {
      userId: emojiSelectedWithUser.id,
      isSelected: true,
    };

    const unSelectedRequest: GetUserEmojisDto = {
      userId: nonEmojiSelectedWithUser.id,
      isSelected: true,
    };

    const nonSelectedRequest: GetUserEmojisDto = {
      userId: userWithOutEmoji.id,
      isSelected: true,
    };

    //마찬가지로 없는유저에 대한 접근할때 테스트 요청과 없는 이모지에 대한 요청테스트코드를 만들것

    const selectedCase = await service.getUseremojis(selectedRequest);
    const unSelectedCase = await service.getUseremojis(unSelectedRequest);
    const noEmojiCase = await service.getUseremojis(nonSelectedRequest);

    //then
    expect(selectedCase.emojis.length).toBe(4);
    expect(unSelectedCase.emojis.length).toBe(1);
    expect(noEmojiCase.emojis.length).toBe(0);

    expect(selectedCase.emojis.length).toBeGreaterThan(0);
    for (const c of selectedCase.emojis) {
      expect(c.status).toBe('selected');
    }
    expect(unSelectedCase.emojis.length).toBe(0);
    expect(noEmojiCase.emojis.length).toBe(0);
  });

  it('유저 이모지 Patch (false/ true 요청을 true로 변환)', async () => {
    //given
    const orderedUser = await testData.createUserWithUnSelectedEmojis();
    const mixedUser = await testData.createUserWithUnSelectedEmojis();

    // isSelected가 다 false인경우
    const orderedRequest: PatchUserEmojisDto = {
      userId: orderedUser.id,
      emojisId: [
        testData.emojis[0].id,
        testData.emojis[1].id,
        testData.emojis[2].id,
        testData.emojis[3].id,
      ],
    };

    const mixedOrderRequest: PatchUserEmojisDto = {
      userId: mixedUser.id,
      emojisId: [
        testData.emojis[2].id,
        testData.emojis[1].id,
        testData.emojis[0].id,
        testData.emojis[3].id,
      ],
    };

    //isSelected가 false와 true가 섞여서 온경우
    //일부 없는 emoji에 접근
    //전부 없는 emoji에 접근

    //when
    //validUpdateDto1 에대한 실행
    await service.patchUseremojis(orderedRequest);
    //validUpdateDto2 에대한 실행
    await service.patchUseremojis(mixedOrderRequest);

    const orderedCase = await userEmojiRepository.find({
      where: { user: { id: orderedUser.id } },
    });
    const mixedCase = await userEmojiRepository.find({
      where: { user: { id: mixedUser.id } },
    });

    expect(orderedCase[0].selectedOrder).toBe(0);
    expect(orderedCase[1].selectedOrder).toBe(1);
    expect(orderedCase[2].selectedOrder).toBe(2);
    expect(orderedCase[3].selectedOrder).toBe(3);

    expect(mixedCase[0].selectedOrder).toBe(2);
    expect(mixedCase[1].selectedOrder).toBe(1);
    expect(mixedCase[2].selectedOrder).toBe(0);
    expect(mixedCase[3].selectedOrder).toBe(3);
  });
});
