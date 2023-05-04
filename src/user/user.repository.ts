import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PatchUserImageDto } from './dto/patch.user.image.dto';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(userId: number): Promise<User> {
    return await this.repository.findOne({ where: { id: userId } });
  }

  async findByNickname(nickname: string): Promise<User> {
    return await this.repository.findOne({ where: { nickname } });
  }

  async updateUserImage(
    user: User,
    patchDto: PatchUserImageDto,
  ): Promise<void> {
    user.imageUrl = patchDto.imageId; //여기야 남준아
    await this.repository.save(user);
  }

  async updateUserStatusMessage(
    user: User,
    patchDto: PatchUserMessageDto,
  ): Promise<void> {
    user.statusMessage = patchDto.message;
    await this.repository.save(user);
  }
}
