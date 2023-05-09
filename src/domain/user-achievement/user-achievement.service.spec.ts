import { Test, TestingModule } from '@nestjs/testing';
import { UserAchievementService } from './user-achievement.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';
import { GetUserAchievementsDto } from './dto/get.user.achievements.dto';
import { PatchUserAchievementsDto } from './dto/patch.user.achievements.dto';
import { BadRequestException } from '@nestjs/common';
import { TestService } from 'src/test/test.service';
import { typeORMConfig } from 'src/configs/typeorm.config';
import { TestModule } from 'src/test/test.module';
import { UserAchievementModule } from './user-achievement.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('UserAchievemetService', () => {
  let service: UserAchievementService;
  let testData: TestService;
  let userAchievementRepository: Repository<UserAchievement>;
  let dataSources: DataSource;

  initializeTransactionalContext();
  beforeAll(async () => {
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
        UserAchievementModule,
        TestModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(UserAchievement),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserAchievementService>(UserAchievementService);
    testData = module.get<TestService>(TestService);
    userAchievementRepository = module.get<Repository<UserAchievement>>(
      getRepositoryToken(UserAchievement),
    );
    dataSources = module.get<DataSource>(DataSource);
    await dataSources.synchronize(true);
  });

  beforeEach(async () => {
    await testData.createProfileImages();
    await testData.createBasicCollectable();
  });

  afterEach(async () => {
    // afterEach가 없어서 일단 만들었는데 여기가 맞는지 모르겠음
    testData.clear();
    jest.resetAllMocks();
    await dataSources.synchronize(true);
  });

  afterAll(async () => {
    await dataSources.dropDatabase();
    await dataSources.destroy();
  });

  it('유저 이모지 전체 Get(selected=false, valid case)', async () => {
    //given
    //false로 들어온 경우
    const achievementSelectedWithUser =
      await testData.createUserWithCollectables();
    const noAchievementSelectedWithUser =
      await testData.createUserWithUnSelectedAchievements();
    const userWithOutAchievement = await testData.createBasicUser();

    //user[0]친구가 : selected와 acheieved, unacheieved가 전부 있음
    const mixedRequest: GetUserAchievementsDto = {
      userId: achievementSelectedWithUser.id,
    };
    //user[1]친구가 : selected가 없는상태
    const unSelectedRequest: GetUserAchievementsDto = {
      userId: noAchievementSelectedWithUser.id,
    };
    //user[2]친구가: achieved도 없는상태
    const noEmojiRequest: GetUserAchievementsDto = {
      userId: userWithOutAchievement.id,
    };
    //없는 유저에 대해서 접근하는 테스트 코드가 필요하다 언제? getUserDetail이 로그인이구현되는 그때

    //When
    const selectedCase = await service.getUserAchievementsAll(mixedRequest);
    const nonSelectedCase = await service.getUserAchievementsAll(
      unSelectedRequest,
    );
    const noEmojiCase = await service.getUserAchievementsAll(noEmojiRequest);

    //then
    expect(selectedCase.achievements.length).toBe(testData.achievements.length);
    expect(
      selectedCase.achievements.some((item) => item.status === 'selected'),
    ).toBe(true);
    expect(
      selectedCase.achievements.some((item) => item.status === 'achieved'),
    ).toBe(true);
    expect(
      selectedCase.achievements.some((item) => item.status === 'unachieved'),
    ).toBe(true);
    expect(nonSelectedCase.achievements.length).toBe(
      testData.achievements.length,
    );
    expect(
      nonSelectedCase.achievements.some((item) => item.status === 'selected'),
    ).toBe(false);
    expect(
      nonSelectedCase.achievements.some((item) => item.status === 'achieved'),
    ).toBe(true);
    expect(
      nonSelectedCase.achievements.some((item) => item.status === 'unachieved'),
    ).toBe(true);
    expect(noEmojiCase.achievements.length).toBe(testData.achievements.length);
    expect(
      noEmojiCase.achievements.some((item) => item.status === 'selected'),
    ).toBe(false);
    expect(
      noEmojiCase.achievements.some((item) => item.status === 'achieved'),
    ).toBe(false);
    expect(
      noEmojiCase.achievements.some((item) => item.status === 'unachieved'),
    ).toBe(true);
  });

  it('유저 선택 이모지 Get (selected=true, valid case)', async () => {
    //given
    const achievementSelectedWithUser =
      await testData.createUserWithCollectables();
    const nonAchievementSelectedWithUser =
      await testData.createUserWithUnSelectedAchievements();
    const userWithOutAchievement = await testData.createBasicUser();
    const userWithReversedAchievement =
      await testData.createReverseSelectedAchievementUser();
    const userWithMixedAchievement =
      await testData.createMixedSelectedAchievementUser();

    //when

    const selectedRequest: GetUserAchievementsDto = {
      userId: achievementSelectedWithUser.id,
    };

    const unSelectedRequest: GetUserAchievementsDto = {
      userId: nonAchievementSelectedWithUser.id,
    };

    const nonSelectedRequest: GetUserAchievementsDto = {
      userId: userWithOutAchievement.id,
    };

    const reverseSelectedRequest: GetUserAchievementsDto = {
      userId: userWithReversedAchievement.id,
    };
    const mixedSelectedRequest: GetUserAchievementsDto = {
      userId: userWithMixedAchievement.id,
    };
    const selectedCase = await service.getUserAchievementsSelected(
      selectedRequest,
    );
    const unSelectedCase = await service.getUserAchievementsSelected(
      unSelectedRequest,
    );
    const noEmojiCase = await service.getUserAchievementsSelected(
      nonSelectedRequest,
    );
    const reversedCase = await service.getUserAchievementsSelected(
      reverseSelectedRequest,
    );
    const mixedCase = await service.getUserAchievementsSelected(
      mixedSelectedRequest,
    );

    //then
    expect(selectedCase.achievements.length).toBe(3);
    expect(selectedCase.achievements[0].status).toBe('selected');
    expect(selectedCase.achievements[1].status).toBe('selected');
    expect(selectedCase.achievements[2].status).toBe('selected');
    expect(selectedCase.achievements[0].id).toBe(testData.achievements[0].id);
    expect(selectedCase.achievements[1].id).toBe(testData.achievements[1].id);
    expect(selectedCase.achievements[2].id).toBe(testData.achievements[2].id);

    expect(unSelectedCase.achievements.length).toBe(3);
    expect(unSelectedCase.achievements[0]).toBe(null);
    expect(unSelectedCase.achievements[1]).toBe(null);
    expect(unSelectedCase.achievements[2]).toBe(null);
    expect(noEmojiCase.achievements.length).toBe(3);
    expect(noEmojiCase.achievements[0]).toBe(null);
    expect(noEmojiCase.achievements[1]).toBe(null);
    expect(noEmojiCase.achievements[2]).toBe(null);

    expect(reversedCase.achievements.length).toBe(3);
    expect(reversedCase.achievements[0].status).toBe('selected');
    expect(reversedCase.achievements[1].status).toBe('selected');
    expect(reversedCase.achievements[2].status).toBe('selected');
    expect(reversedCase.achievements[0].id).toBe(testData.achievements[2].id);
    expect(reversedCase.achievements[1].id).toBe(testData.achievements[1].id);
    expect(reversedCase.achievements[2].id).toBe(testData.achievements[0].id);

    expect(mixedCase.achievements[0].id).toBe(testData.achievements[2].id);
    expect(mixedCase.achievements[1]).toBe(null);
    expect(mixedCase.achievements[2].id).toBe(testData.achievements[3].id);
  });

  it('유저 이모지 Patch (valid case)', async () => {
    //given
    const orderedUser = await testData.createUserWithUnSelectedAchievements();
    const mixedUser = await testData.createUserWithUnSelectedAchievements();
    const mixedWithNullUser =
      await testData.createUserWithUnSelectedAchievements();

    // isSelected가 다 false인경우
    const orderedRequest: PatchUserAchievementsDto = {
      userId: orderedUser.id,
      achievementsId: [
        testData.achievements[0].id,
        testData.achievements[1].id,
        testData.achievements[2].id,
      ],
    };

    const mixedOrderRequest: PatchUserAchievementsDto = {
      userId: mixedUser.id,
      achievementsId: [
        testData.achievements[2].id,
        testData.achievements[1].id,
        testData.achievements[0].id,
      ],
    };

    const mixedWithNullRequest: PatchUserAchievementsDto = {
      userId: mixedWithNullUser.id,
      achievementsId: [null, testData.achievements[2].id, null],
    };

    //when
    //validUpdateDto1 에대한 실행
    await service.patchUserAchievements(orderedRequest);
    //validUpdateDto2 에대한 실행
    await service.patchUserAchievements(mixedOrderRequest);
    await service.patchUserAchievements(mixedWithNullRequest);

    const orderedCase: UserAchievement[] = await userAchievementRepository.find(
      {
        where: { user: { id: orderedUser.id }, selectedOrder: Not(IsNull()) },
        order: { selectedOrder: 'ASC' },
      },
    );
    const mixedCase: UserAchievement[] = await userAchievementRepository.find({
      where: { user: { id: mixedUser.id }, selectedOrder: Not(IsNull()) },
      order: { selectedOrder: 'ASC' },
    });
    const mixeWithNullCase: UserAchievement[] =
      await userAchievementRepository.find({
        where: {
          user: { id: mixedWithNullUser.id },
          selectedOrder: Not(IsNull()),
        },
        order: { selectedOrder: 'ASC' },
      });

    expect(orderedCase.length).toBe(3);
    expect(orderedCase[0].selectedOrder).toBe(0);
    expect(orderedCase[1].selectedOrder).toBe(1);
    expect(orderedCase[2].selectedOrder).toBe(2);
    expect(orderedCase[0].achievement.id).toBe(testData.achievements[0].id);
    expect(orderedCase[1].achievement.id).toBe(testData.achievements[1].id);
    expect(orderedCase[2].achievement.id).toBe(testData.achievements[2].id);

    expect(mixedCase.length).toBe(3);
    expect(mixedCase[0].selectedOrder).toBe(0);
    expect(mixedCase[1].selectedOrder).toBe(1);
    expect(mixedCase[2].selectedOrder).toBe(2);
    expect(mixedCase[0].achievement.id).toBe(testData.achievements[2].id);
    expect(mixedCase[1].achievement.id).toBe(testData.achievements[1].id);
    expect(mixedCase[2].achievement.id).toBe(testData.achievements[0].id);

    expect(mixeWithNullCase.length).toBe(1);
    expect(mixeWithNullCase[0].selectedOrder).toBe(1);
  });

  it('유저 이모지 Patch (invalid case)', async () => {
    //given
    const oneValidTwoInvalidUser = await testData.createUserWithCollectables();
    const allInvalidUser =
      await testData.createUserWithUnSelectedAchievements();

    // isSelected가 다 false인경우
    const oneValidTwoInvalidRequest: PatchUserAchievementsDto = {
      userId: oneValidTwoInvalidUser.id,
      achievementsId: [testData.achievements[0].id, null, 10000000],
    };

    const allInvalidRequest: PatchUserAchievementsDto = {
      userId: allInvalidUser.id,
      achievementsId: [-1, -2, -3],
    };

    const pastTitle = await userAchievementRepository.find({
      where: {
        user: { id: oneValidTwoInvalidUser.id },
        selectedOrder: Not(IsNull()),
      },
    });

    //when
    //validUpdateDto1 에대한 실행
    await expect(
      service.patchUserAchievements(oneValidTwoInvalidRequest),
    ).rejects.toThrow(new BadRequestException());
    //validUpdateDto2 에대한 실행
    await expect(
      service.patchUserAchievements(allInvalidRequest),
    ).rejects.toThrow(new BadRequestException());

    const afterPatch = await userAchievementRepository.find({
      where: {
        user: { id: oneValidTwoInvalidUser.id },
        selectedOrder: Not(IsNull()),
      },
    });
    expect(pastTitle.length).toBe(afterPatch.length);
    expect(pastTitle[0].id).toBe(afterPatch[0].id);
  });
});
