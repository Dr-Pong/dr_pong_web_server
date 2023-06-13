import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { Repository } from 'typeorm';
import { PatchUserMessageDto } from './dto/patch.user.message.dto';
import { User } from './user.entity';
import { PostGatewayUserDto } from './dto/post.gateway.users.dto';

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

  async updateUserImage(user: User, image: ProfileImage): Promise<void> {
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

  async save(postDto: PostGatewayUserDto): Promise<void> {
    await this.repository.save({
      id: postDto.id,
      nickname: postDto.nickname,
      image: {
        id: postDto.imgId,
        url: postDto.imgUrl,
      },
    });
  }
}
