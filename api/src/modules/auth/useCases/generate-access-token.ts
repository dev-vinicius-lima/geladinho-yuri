import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { FindManyUserPerfil } from 'src/utils/prisma-queries/find-many-user-perfil';
import { DataTokenType, UserDataCreateToken } from '../@types/token';
import { doExpiresIn, verifyRefreshToken } from 'src/utils/functions/security';
import { ENV_CONFIG } from 'src/config/envConfig';

class GenerateAccessTokensCase {
  private readonly prismaService: PrismaService;
  private readonly jwtService: JwtService;

  constructor(prismaService: PrismaService, jwtService: JwtService) {
    this.prismaService = prismaService;
    this.jwtService = jwtService;
  }

  async execute(user: UserDataCreateToken) {
    const perfis = await new FindManyUserPerfil(this.prismaService).execute(
      user.id,
    );

    const tokenVerify = user.refresh_token
      ? await verifyRefreshToken(this.jwtService, user.refresh_token)
      : undefined;

    const dataToken: DataTokenType = {
      sub: user.id,
      perfis: perfis,
      admin: user.administrador,
    };

    if (tokenVerify?.isVerify) {
      const at = await this.jwtService.signAsync(dataToken, {
        secret: process.env.JWT_AT_SECRET,
        expiresIn: doExpiresIn(ENV_CONFIG.JWT_AT_EXPIRES),
      });

      return {
        access_token: at,
        refresh_token: user.refresh_token,
      };
    } else {
      const [at, rt] = await Promise.all([
        this.jwtService.signAsync(dataToken, {
          secret: process.env.JWT_AT_SECRET,
          expiresIn: doExpiresIn(ENV_CONFIG.JWT_AT_EXPIRES),
        }),
        this.jwtService.signAsync(
          {
            sub: user.id,
          },
          {
            secret: process.env.JWT_RT_SECRET,
            expiresIn: doExpiresIn(ENV_CONFIG.JWT_RT_EXPIRES),
          },
        ),
      ]);

      return {
        access_token: at,
        refresh_token: rt,
      };
    }
  }
}

export { GenerateAccessTokensCase };
