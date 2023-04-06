import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUsersDetailDto } from './dto/get.users.detail.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:nickname/detail')
  async getUserDetailByNickname(@Param('nickname') nickname: string) {
    const getUserDetailDto: GetUsersDetailDto = { nickname };
  }
}
