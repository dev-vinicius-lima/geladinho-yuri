import { ApiProperty } from '@nestjs/swagger';

class ResponseMessage<T> {
  @ApiProperty()
  public readonly message: string;
  @ApiProperty()
  public readonly data?: T;

  constructor(message: string, data?: T) {
    this.message = message;
    this.data = data;
  }
}

export { ResponseMessage };
