import { UserGameRecordDto, UserGameRecordsDto } from './user-game.records.dto';

export class UserGameRecordsResponseDto {
  records: UserGameRecordDto[];

  static fromUserGameRecordResponse(
    userGameRecords: UserGameRecordsDto,
  ): UserGameRecordsResponseDto {
    const responseDto: UserGameRecordsResponseDto =
      new UserGameRecordsResponseDto();
    responseDto.records = userGameRecords.records;
    return responseDto;
  }
}
