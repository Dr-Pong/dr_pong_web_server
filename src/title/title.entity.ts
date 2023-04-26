import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Title extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name:'name', type: 'varchar', default: ''})
  name: string;

  @Column({name:'content', type: 'varchar', default: ''})
  content: string;
}
