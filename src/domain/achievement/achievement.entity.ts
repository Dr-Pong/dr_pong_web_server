import { BaseTimeEntity } from 'src/global/base-entity/base-time.entity';
import { Title } from 'src/domain/title/title.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Achievement extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Title, { eager: true, nullable: true })
  @JoinColumn({ name: 'title_id' })
  title: Title | null;

  @Column({ name: 'name', type: 'varchar', default: '' })
  name: string;

  @Column({ name: 'content', type: 'varchar', default: '' })
  content: string;

  @Column({ name: 'image_url', type: 'varchar' })
  imageUrl: string;
}
