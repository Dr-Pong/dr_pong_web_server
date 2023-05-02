import { BadRequestException } from "@nestjs/common";
import { Repository } from "typeorm";
import { UserTitle } from "./user-title.entity";

export class UserTitleRepository extends Repository<UserTitle> {
	async findAllByUserId(userId:number): Promise<UserTitle[]> {
		const userTitles: UserTitle[] = await this.find({where:{user:{id:userId}}});
		return userTitles;
	}

	async findByUserIdAndSelected(userId:number, selected:boolean): Promise<UserTitle> {
		const selectedUserTitle: UserTitle = await this.findOne({where:{user:{id:userId}, isSelected:selected}});
		return selectedUserTitle;
	}

	async updateIsSelectedFalse(userTitle: UserTitle): Promise<void> {
		userTitle.isSelected = false;
		await this.save(userTitle);
	}

	async findOneByUserIdAndTitleId(userId:number, titleId:number): Promise<UserTitle> {
		const userTitle: UserTitle = await this.findOne({where:{user:{id:userId}, title:{id:titleId}}});
		if (!userTitle) {
			throw new BadRequestException('No such title');
		}
		return userTitle;
	}

	async updateIsSelectedTrue(userTitle: UserTitle): Promise<void> {
		userTitle.isSelected = true;
		await this.save(userTitle);
	}
}