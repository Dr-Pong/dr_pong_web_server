import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { User } from 'src/domain/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserTestService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProfileImage)
    private profileImageRepository: Repository<ProfileImage>,
  ) {}
  users: User[] = [];
  profileImages: ProfileImage[] = [];

  clear() {
    this.users.splice(0);
    this.profileImages.splice(0);
  }
  async createProfileImages(): Promise<void> {
    this.profileImages.push(
      await this.profileImageRepository.save({
        url: 'basic image1',
      }),
    );
    this.profileImages.push(
      await this.profileImageRepository.save({
        url: 'basic image2',
      }),
    );
  }

  /** 유저 생성 태초 유저임*/
  async createBasicUser(): Promise<User> {
    const index: number = this.users.length;
    const user = await this.userRepository.save({
      id: index + 2,
      nickname: 'user' + index.toString(),
      image: this.profileImages[0],
      exp: 0,
    });
    this.users.push(user);
    return user;
  }

  async createLevel9Users(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      const user = await this.userRepository.save({
        id: i + 1,
        nickname: 'user' + i.toString(),
        email: i.toString() + '@mail.com',
        statusMessage: i.toString(),
        image: this.profileImages[0],
      });
      this.users.push(user);
    }
  }

  async createBasicUsers(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      const user = await this.userRepository.save({
        id: i + 1,
        nickname: 'user' + i.toString(),
        email: i.toString() + '@mail.com',
        statusMessage: i.toString(),
        image: this.profileImages[i % 2],
      });
      this.users.push(user);
    }
  }

  /** 이미지 없는 유저 생성*/
  async createBasicUserWithoutImg(): Promise<User> {
    const index: number = this.users.length;
    const user = await this.userRepository.save({
      id: index + 1,
      nickname: 'user' + index.toString(),
      email: index.toString() + '@mail.com',
      statusMessage: index.toString(),
      image: this.profileImages[0],
    });
    this.users.push(user);
    return user;
  }
}
