import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileImage } from 'src/profile-image/profile-image.entity';
import { DataSource, Repository } from 'typeorm';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }

  async findById(userId: number): Promise<User> {
    return await this.repository.findOne({ where: { id: userId } });
  }

  async findByNickname(nickname: string): Promise<User> {
    return await this.repository.findOne({ where: { nickname } });
  }

  async updateUserImage(
    user: User,
    image: ProfileImage,
  ): Promise<void> {
    user.image = image;
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
