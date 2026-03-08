import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SinginLocalDto } from './dto/signin-local.dto';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/is-public.decorator';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RecoverDto } from './dto/recover.dto';
import { ChangePasswordDto } from 'src/modules/auth/dto/change-password.dto';
import type { DataTokenType } from 'src/modules/auth/@types/token';

@ApiTags('Autenticação')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  singinLocal(@Body() dto: SinginLocalDto, @Ip() ip: string) {
    console.log('Login chamado');
    return this.authService.signinLocal(dto, ip);
  }

  @Get('local/whoami')
  whoAmI(@GetCurrentUser() user: DataTokenType) {
    return this.authService.whoAmI(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body);
  }

  @Public()
  @Post('recovery')
  @HttpCode(HttpStatus.OK)
  requestRecover(@Body() dto: RecoverDto) {
    return this.authService.requestRecover(dto);
  }

  @Public()
  @Post('verify-user')
  @HttpCode(HttpStatus.OK)
  verifyUserByCpf(@Body() data: { cpf: string }) {
    return this.authService.verifyUser(data);
  }

  @Public()
  @Post('recovery-mobile')
  @HttpCode(HttpStatus.OK)
  requestRecoverMobile(@Body() dto: RecoverDto) {
    return this.authService.requestRecoverMobile(dto);
  }

  @Public()
  @Post('verify-codigo-mobile')
  @HttpCode(HttpStatus.OK)
  verifyCodigoRecoveryMobile(@Body() data: { email: string; codigo: string }) {
    return this.authService.verifyCodigoRecoveryMobile(data.email, data.codigo);
  }

  @Public()
  @Patch('change-password')
  recover(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.recover(changePasswordDto);
  }
}
