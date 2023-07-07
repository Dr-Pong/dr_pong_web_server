export class UpdateUserTitleDto {
  userId: number;
  titleId: number;

  constructor(userId: number, titleId: number) {
    this.userId = userId;
    this.titleId = titleId;
  }
}

export class UpdateUserTitlesDto {
  updateUserTitles: UpdateUserTitleDto[];
}
