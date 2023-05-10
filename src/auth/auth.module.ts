import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/user/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/auth.jwt.strategy';
import { ProfileImage } from 'src/domain/profile-image/profile-image.entity';
import { UserRepository } from './user.repository';
import { ProfileImageRepository } from './profile-image.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'jwtSecret',
      signOptions: {
        expiresIn: 60 * 60 * 60,
      }
    }),
    TypeOrmModule.forFeature([User, ProfileImage]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserRepository, ProfileImageRepository],
  exports: [JwtModule, JwtStrategy, PassportModule, AuthService],
})
export class AuthModule { }
