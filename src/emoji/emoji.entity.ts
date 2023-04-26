import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Emoji extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'name', type: 'varchar', default: ''})
  name: string;

  @Column({name: 'image_url', type: 'varchar'})
  imageUrl: string;
}
