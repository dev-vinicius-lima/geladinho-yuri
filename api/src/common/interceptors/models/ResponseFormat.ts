import { ApiProperty } from '@nestjs/swagger';

export class ResponseFormat<T> {
  @ApiProperty()
  path: string;
  @ApiProperty()
  duration: string;
  @ApiProperty()
  method: string;

  @ApiProperty()
  data: T;
  @ApiProperty()
  message: string;
}
