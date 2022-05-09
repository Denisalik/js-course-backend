import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { WsGateway } from './ws.gateway';
import * as fs from 'fs';

let envFilePath = '.env';
if (process.env.ON_HEROKU) {
  const arr = process.env.DATABASE_URL.split(':');
  fs.writeFile(
    '.env.prod',
    'POSTGRES_DB=postgres\n' +
      `POSTGRES_USER=${arr[1].substring(2)}\n` +
      `POSTGRES_PASSWORD=${arr[2]}\n` +
      'POSTGRES_HOST=db\n' +
      'POSTGRES_PORT=5432',
    (err) => {
      if (err) throw err;
    },
  );
  envFilePath = '.env.prod';
}

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),

      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User],
      autoLoadModels: true,
    }),
    AuthModule,
    RouterModule.register([
      {
        path: '/api',
        module: AppModule,
        children: [
          {
            path: '/users',
            module: UsersModule,
          },
          {
            path: '/auth',
            module: AuthModule,
          },
        ],
      },
    ]),
  ],
  providers: [AppService, WsGateway],
})
export class AppModule {}
