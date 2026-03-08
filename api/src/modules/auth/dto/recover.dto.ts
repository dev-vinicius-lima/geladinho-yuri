import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecoverDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
