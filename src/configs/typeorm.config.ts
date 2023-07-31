import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'web-db',
  name: 'web-ser',
  port: 5432,
  username: process.env.WEB_DB_USER,
  password: process.env.WEB_DB_PASSWORD,
  database: process.env.WEB_DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
  poolSize: 10,
};
