import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './modules/@global/globa.module';
import { AuthModule } from './modules/auth/auth.module';
import { AtGuard } from './modules/auth/guard/at.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GlobalModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_AUTH_USER,
          pass: process.env.MAIL_AUTH_PASS,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AtGuard },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
