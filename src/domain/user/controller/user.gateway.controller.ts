import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../user.service';
import { PostGatewayUserDto } from '../dto/post.gateway.users.dto';

@Controller('users')
export class UserGatewayController {
  constructor(private userService: UserService) {}

  @Post('/')
  async userPost(
    @Body() postGatewayUserDto: PostGatewayUserDto,
  ): Promise<void> {
    await this.userService.postUser(postGatewayUserDto);
  }
}
