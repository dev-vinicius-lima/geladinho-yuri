import { ApiProperty } from '@nestjs/swagger';

class QuerySortDto {
  @ApiProperty({
    required: false,
  })
  id: string;

  @ApiProperty({
    required: false,
  })
  desc: string;
}

export { QuerySortDto };
