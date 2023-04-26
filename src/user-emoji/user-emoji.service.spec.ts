import { Test, TestingModule } from '@nestjs/testing';
import { UserEmojiService } from './user-emoji.service';
import { DataSource, Not, Repository } from 'typeorm';
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

  it('유저 이모지 전체 Get(selected=false, valid case)', async () => {
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

  it('유저 선택 이모지 Get (selected=true, valid case)', async () => {
    //given
    const emojiSelectedWithUser = await testData.createUserWithCollectables();
    const nonEmojiSelectedWithUser = await testData.createUserWithUnSelectedEmojis();
    const userWithOutEmoji = await testData.createBasicUser();
    const userWithReversedEmoji = await testData.createReverseSelectedEmojiUser();
    const userWithMixedEmoji = await testData.createMixedSelectedEmojiUser();

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

    const reverseSelectedRequest: GetUserEmojisDto = {
      userId: userWithReversedEmoji.id,
      isSelected: true,
    }
    const mixedSelectedRequest: GetUserEmojisDto = {
      userId: userWithMixedEmoji.id,
      isSelected: true,
    }
    const selectedCase = await service.getUseremojis(selectedRequest);
    const unSelectedCase = await service.getUseremojis(unSelectedRequest);
    const noEmojiCase = await service.getUseremojis(nonSelectedRequest);
    const reversedCase = await service.getUseremojis(reverseSelectedRequest);
    const mixedCase = await service.getUseremojis(mixedSelectedRequest);

    //then
    expect(selectedCase.emojis.length).toBe(4);
    expect(unSelectedCase.emojis.length).toBe(0);
    expect(noEmojiCase.emojis.length).toBe(0);

    expect(selectedCase.emojis.length).toBeGreaterThan(0);
    expect(selectedCase.emojis[0].status).toBe('selected');
    expect(selectedCase.emojis[1].status).toBe('selected');
    expect(selectedCase.emojis[2].status).toBe('selected');
    expect(selectedCase.emojis[3].status).toBe('selected');
    expect(selectedCase.emojis[0].id).toBe(1);
    expect(selectedCase.emojis[1].id).toBe(2);
    expect(selectedCase.emojis[2].id).toBe(3);
    expect(selectedCase.emojis[3].id).toBe(4);
    expect(unSelectedCase.emojis.length).toBe(0);
    expect(noEmojiCase.emojis.length).toBe(0);

    expect(reversedCase.emojis.length).toBeGreaterThan(0);
    expect(reversedCase.emojis[0].status).toBe('selected');
    expect(reversedCase.emojis[1].status).toBe('selected');
    expect(reversedCase.emojis[2].status).toBe('selected');
    expect(reversedCase.emojis[3].status).toBe('selected');
    expect(reversedCase.emojis[0].id).toBe(4);
    expect(reversedCase.emojis[1].id).toBe(3);
    expect(reversedCase.emojis[2].id).toBe(2);
    expect(reversedCase.emojis[3].id).toBe(1);

    expect(mixedCase.emojis[0]).toBe(null);
    expect(mixedCase.emojis[1].id).toBe(3);
    expect(mixedCase.emojis[2]).toBe(null);
    expect(mixedCase.emojis[3].id).toBe(1);
  });

  it('유저 이모지 Patch (valid case)', async () => {
    //given
    const orderedUser = await testData.createUserWithUnSelectedEmojis();
    const mixedUser = await testData.createUserWithUnSelectedEmojis();
    const mixedWithNullUser = await testData.createUserWithUnSelectedEmojis();

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

    const mixedWithNullRequest: PatchUserEmojisDto = {
      userId: mixedWithNullUser.id,
      emojisId: [
        null,
        testData.emojis[3].id,
        null,
        testData.emojis[1].id,
      ],
    };

    //when
    //validUpdateDto1 에대한 실행
    await service.patchUseremojis(orderedRequest);
    //validUpdateDto2 에대한 실행
    await service.patchUseremojis(mixedOrderRequest);
    await service.patchUseremojis(mixedWithNullRequest);

    const orderedCase : UserEmoji[] = await userEmojiRepository.find({
      where: { user: { id: orderedUser.id }, selectedOrder:Not(null) },
      order:{selectedOrder:'ASC'},
    });
    const mixedCase : UserEmoji[] = await userEmojiRepository.find({
      where: { user: { id: mixedUser.id }, selectedOrder:Not(null) },
      order:{selectedOrder:'ASC'},
    });
    const mixeWithNullCase: UserEmoji[] = await userEmojiRepository.find({
      where:{user:{id:mixedWithNullUser.id}, selectedOrder:Not(null)},
      order:{selectedOrder:'ASC'},
    })

    expect(orderedCase.length).toBe(4);
    expect(orderedCase[0].selectedOrder).toBe(0);
    expect(orderedCase[1].selectedOrder).toBe(1);
    expect(orderedCase[2].selectedOrder).toBe(2);
    expect(orderedCase[3].selectedOrder).toBe(3);
    expect(orderedCase[0].emoji.id).toBe(0);
    expect(orderedCase[1].emoji.id).toBe(1);
    expect(orderedCase[2].emoji.id).toBe(2);
    expect(orderedCase[3].emoji.id).toBe(3);

    expect(mixedCase.length).toBe(4);
    expect(mixedCase[0].selectedOrder).toBe(0);
    expect(mixedCase[1].selectedOrder).toBe(1);
    expect(mixedCase[2].selectedOrder).toBe(2);
    expect(mixedCase[3].selectedOrder).toBe(3);
    expect(mixedCase[0].emoji.id).toBe(2);
    expect(mixedCase[1].emoji.id).toBe(1);
    expect(mixedCase[2].emoji.id).toBe(0);
    expect(mixedCase[3].emoji.id).toBe(3);

    expect(mixeWithNullCase.length).toBe(2);
    expect(mixeWithNullCase[0].selectedOrder).toBe(1);
    expect(mixeWithNullCase[1].selectedOrder).toBe(3);
    expect(mixeWithNullCase[0].emoji.id).toBe(3);
    expect(mixeWithNullCase[1].emoji.id).toBe(1);
  });

  it('유저 이모지 Patch (invalid case)', async () => {
    //given
    const oneValidTwoInvalidUser = await testData.createUserWithUnSelectedEmojis();
    const allInvalidUser = await testData.createUserWithUnSelectedEmojis();

    // isSelected가 다 false인경우
    const oneValidTwoInvalidRequest: PatchUserEmojisDto = {
      userId: oneValidTwoInvalidUser.id,
      emojisId: [
        testData.emojis[0].id,
        null,
        10000000,
        -100,
      ],
    };

    const allInvalidRequest: PatchUserEmojisDto = {
      userId: allInvalidUser.id,
      emojisId: [
        -1,
        -2,
        -3,
        -4,
      ],
    };

    //when
    //validUpdateDto1 에대한 실행
    await expect(
      service.patchUseremojis(oneValidTwoInvalidRequest)
    ,).rejects.toThrow(new BadRequestException('No such emojis'));
    //validUpdateDto2 에대한 실행
    await expect(
      service.patchUseremojis(allInvalidRequest)
    ,).rejects.toThrow(new BadRequestException('No such emojis'));
  });
});
