import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBooleanString, IsOptional } from 'class-validator';

class FindAllSelectDefaultDto {
  @ApiProperty({
    required: false,
  })
  @IsBooleanString()
  @IsOptional()
  ativo?: string;

  @ApiProperty({
    required: false,
  })
  @IsArray()
  @IsOptional()
  idsNotIn: string[];
}

export { FindAllSelectDefaultDto };
