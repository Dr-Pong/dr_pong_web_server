import { Repository } from "typeorm";
import { PatchUserDetailDto } from "./dto/patch.user.detail.dto";
import { User } from "./user.entity";

export class UserRepository extends Repository<User> {
	async findById(userId: number): Promise<User> {
		return await this.findOne({where:{id:userId}});
	}

	async findByNickname(nickname: string): Promise<User> {
		return await this.findOne({where:{nickname}});
	}

	async updateUser(user: User,patchDto: PatchUserDetailDto): Promise<void> {
		user.imageUrl = patchDto.imgUrl;
		user.statusMessage = patchDto.statusMessage;
		await this.save(user);
	}
}