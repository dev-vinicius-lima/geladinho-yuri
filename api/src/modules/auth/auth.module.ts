import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from './strategies/at.strategy';
import { EmailService } from 'src/common/external-service/mailer.service';
import { RedisService } from 'src/common/services/redis.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, EmailService, RedisService],
})
export class AuthModule {}
