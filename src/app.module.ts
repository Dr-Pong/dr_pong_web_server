import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TitleModule } from './title/title.module';
import { UsertitleModule } from './user-title/user-title.module';
import { typeORMConfig } from './configs/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule,
    TitleModule,
    UsertitleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
