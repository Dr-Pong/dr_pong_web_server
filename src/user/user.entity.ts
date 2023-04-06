import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  nickname: string;

  @Column()
  imageUrl: string;

  @Column()
  statusMessage: string;

  @Column()
  email: string;
}
