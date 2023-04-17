import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Title } from 'src/title/title.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Achievemet extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Title, { eager: true, nullable: true })
  @JoinColumn({ name: 'title_id' })
  title: Title | null;

  @Column()
  name: string;

  @Column()
  content: string;

  @Column()
  imageUrl: string;
}
