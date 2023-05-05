import { BaseTimeEntity } from "src/base-entity/base-time.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProfileImage extends BaseTimeEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'url', nullable: false })
	url: string;
}
