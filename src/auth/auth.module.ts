import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './auth.fortytwo.strategy';

@Module({
  controllers: [AuthController],
  providers:[FortyTwoStrategy]
})
export class AuthModule {}
