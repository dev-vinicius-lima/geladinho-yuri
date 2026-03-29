import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class VincularPerfilDto {
  @ApiProperty({ example: 'uuid-do-perfil' })
  @IsUUID()
  @IsNotEmpty()
  perfil_id: string;
}
