export class UpdateUserTitleDto {
  userId: number;
  title: string;

  constructor(userId: number, titleId: string) {
    this.userId = userId;
    this.title = titleId;
  }
}

export class UpdateUserTitlesDto {
  updateUserTitles: UpdateUserTitleDto[];
}
