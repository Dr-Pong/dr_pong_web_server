import { UserGameRecordDto } from './user-game.records.dto';

export class UserGameRecordsResponseDto {
  records: UserGameRecordDto[];
  isLastPage: boolean;
}
