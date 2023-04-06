import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userRepository: UserService) {}

  // @Get('/:nickname/detail')
  // async getUserDetailByNickname(@Param())
}
