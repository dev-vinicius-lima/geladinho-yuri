import { ApiProperty } from '@nestjs/swagger';

class QuerySearchDto {
  @ApiProperty({
    required: false,
  })
  id: string;

  @ApiProperty({
    required: false,
  })
  value: string;

  @ApiProperty({
    required: false,
    type: [QuerySearchDto],
    isArray: true,
  })
  filhos?: QuerySearchDto[];
  field: string;
  descricao?: string;
  query?: any;
}

export { QuerySearchDto };
