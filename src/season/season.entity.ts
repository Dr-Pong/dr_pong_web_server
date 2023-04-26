import { BaseTimeEntity } from 'src/base-entity/base-time.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Season extends BaseTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'name', type: 'varchar', default: ''})
  name: string;

  @Column({name: 'start_time' , type: 'date'})
  startTime: Date;

  @Column({name: 'end_time', type: 'date'})
  endTime: Date;

  @Column({name: 'image_url', type: 'varchar'})
  imageUrl: string;
}
