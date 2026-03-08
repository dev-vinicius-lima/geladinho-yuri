import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { IsExistConstraint } from 'src/utils/custom-validations/is-exist';
import { IsUniqueConstraint } from 'src/utils/custom-validations/is-unique';

@Global()
@Module({
  providers: [PrismaService, IsExistConstraint, IsUniqueConstraint],
  exports: [PrismaService, IsExistConstraint, IsUniqueConstraint],
})
export class GlobalModule {}
