import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PatchUserDetailDto } from "./dto/patch.user.detail.dto";
import { User } from "./user.entity";

export class UserRepository {
	constructor (
		@InjectRepository(User)
		private repository: Repository<User>,
	) {}

	async findById(userId: number): Promise<User> {
		return await this.repository.findOne({where:{id:userId}});
	}

	async findByNickname(nickname: string): Promise<User> {
		return await this.repository.findOne({where:{nickname}});
	}

	async updateUser(user: User,patchDto: PatchUserDetailDto): Promise<void> {
		user.imageUrl = patchDto.imgUrl;
		user.statusMessage = patchDto.statusMessage;
		await this.repository.save(user);
	}
}