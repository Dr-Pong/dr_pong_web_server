import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseTimeEntity extends BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
