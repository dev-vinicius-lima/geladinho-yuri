import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ToggleStatusDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Campo `id` obrigatório.' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Campo `Novo Status` obrigatório.' })
  newStatus: boolean;
}
