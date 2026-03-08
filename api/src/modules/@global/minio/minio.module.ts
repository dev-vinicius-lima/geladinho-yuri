import { Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioModule {}
