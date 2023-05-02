import { Repository } from "typeorm";
import { Emoji } from "./emoji.entity";

export class EmojiRepository extends Repository<Emoji> {
	async findAll(): Promise<Emoji[]> {
		return await this.find();
	}
}
