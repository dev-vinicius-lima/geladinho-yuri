import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  senha: string;
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
