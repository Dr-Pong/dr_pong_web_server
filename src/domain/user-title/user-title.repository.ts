import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserTitle } from "./user-title.entity";

@Injectable()
export class UserTitleRepository {
	constructor(
		@InjectRepository(UserTitle)
		private readonly repository: Repository<UserTitle>,
	) { }
	async findAllByUserId(userId: number): Promise<UserTitle[]> {
		const userTitles: UserTitle[] = await this.repository.find({ where: { user: { id: userId } } });
		return userTitles;
	}

	async findByUserIdAndSelected(userId: number, selected: boolean): Promise<UserTitle> {
		const selectedUserTitle: UserTitle = await this.repository.findOne({ where: { user: { id: userId }, isSelected: selected } });
		return selectedUserTitle;
	}

	async updateIsSelectedFalse(userTitle: UserTitle): Promise<void> {
		userTitle.isSelected = false;
		await this.repository.save(userTitle);
	}

	async findByUserIdAndTitleId(userId: number, titleId: number): Promise<UserTitle> {
		const userTitle: UserTitle = await this.repository.findOne({ where: { user: { id: userId }, title: { id: titleId } } });
		return userTitle;
	}

	async updateIsSelectedTrue(userTitle: UserTitle): Promise<void> {
		userTitle.isSelected = true;
		await this.repository.save(userTitle);
	}
}