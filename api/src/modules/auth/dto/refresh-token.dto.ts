import { IsNotEmpty, IsString } from 'class-validator';

class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export { RefreshTokenDto };
