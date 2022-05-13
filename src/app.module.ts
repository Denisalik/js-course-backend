import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { WsGateway } from './ws.gateway';

// If on heroku, set env vars for production db and ignore .env file.
if (process.env.ON_HEROKU) {
  const params = process.env.DATABASE_URL.match(
    /postgres:\/\/(?<user>[a-z]+):(?<pass>[a-z\d]+)+@(?<host>[a-z\d\-.]+):(?<port>\d+)\/(?<dbname>[a-z\d]+)/,
  ).groups;
  process.env['POSTGRES_DB'] = params.dbname;
  process.env['POSTGRES_USER'] = params.user;
  process.env['POSTGRES_PASSWORD'] = params.pass;
  process.env['POSTGRES_HOST'] = params.host;
  process.env['POSTGRES_PORT'] = params.port;
}

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      ignoreEnvFile: Boolean(process.env.ON_HEROKU),
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
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
