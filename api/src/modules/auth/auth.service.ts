import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from 'src/common/external-service/mailer.service';
import { ResponseMessage } from 'src/common/message/response-message';
import { NAME_APLICATION } from 'src/config/constants';
import { PrismaService } from 'src/database/prisma.service';
import { ChangePasswordDto } from 'src/modules/auth/dto/change-password.dto';
import { hashData, removeMaskedCPF } from 'src/utils/functions/default';
import {
  comparePassword,
  verifyRefreshToken,
} from 'src/utils/functions/security';
import { DataTokenType, UserDataCreateToken } from './@types/token';
import { RecoverDto } from './dto/recover.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SinginLocalDto } from './dto/signin-local.dto';
import { GenerateAccessTokensCase } from './useCases/generate-access-token';
import { TokenRecovery } from './useCases/token-recovery';
import { UpdateUserAuthCase } from './useCases/update-user-auth';
import { UserSettingsCase } from './useCases/user-settings';

@ApiTags('Autenticação')
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly mailService: EmailService,
  ) {}

  async signinLocal(dto: SinginLocalDto, ip: string) {
    const { cpf, senha } = dto;

    const userIsExist = await this.prismaService.usuario.findFirst({
      select: {
        id: true,
        cpf: true,
        senha: true,
        apelido: true,
        usuario_perfil_usuario_perfil_usuario_idTousuario: {
          select: {
            perfil: {
              select: {
                identificador: true,
              },
            },
          },
        },
        administrador: true,
        ativo: true,
        refresh_token: true,
      },

      where: {
        cpf: cpf,
        ativo: true,
      },
    });

    if (!userIsExist) {
      throw new BadRequestException('CPF ou Senha incorreta.');
    }

    const passwordMatches = await comparePassword(
      senha,
      userIsExist.senha || '',
    );

    if (!passwordMatches) {
      throw new BadRequestException('CPF ou Senha incorreta.');
    }

    const tokens = await new GenerateAccessTokensCase(
      this.prismaService,
      this.jwtService,
    ).execute(userIsExist);

    await new UpdateUserAuthCase(this.prismaService).execute({
      id: userIsExist.id,
      refresh_token: tokens.refresh_token,
      ultimo_acesso_ip: ip,
    });

    const { user, permissions } = await new UserSettingsCase(
      this.prismaService,
    ).execute(userIsExist.id);

    const responseMessage = new ResponseMessage('Success', user);

    return {
      ...responseMessage,
      ...tokens,
      permissoes: permissions,
    };
  }

  async whoAmI(userToken: DataTokenType) {
    const { user, permissions } = await new UserSettingsCase(
      this.prismaService,
    ).execute(userToken.sub, userToken.admin);

    const responseMessage = new ResponseMessage('Success', user);

    return { ...responseMessage, permissoes: permissions };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const { refresh_token } = dto;

    const { data, isVerify } = await verifyRefreshToken(
      this.jwtService,
      refresh_token,
    );

    let user: UserDataCreateToken | null = null;

    if (!isVerify) {
      user = await this.prismaService.usuario.findFirst({
        select: {
          id: true,
          administrador: true,
          apelido: true,
          refresh_token: true,
        },
        where: {
          refresh_token: refresh_token,
        },
      });
    } else {
      user = await this.prismaService.usuario.findFirst({
        select: {
          id: true,
          administrador: true,
          apelido: true,
          refresh_token: true,
        },
        where: {
          refresh_token: refresh_token,
          id: data?.sub,
        },
      });
    }

    if (!user) {
      throw new BadRequestException();
    }

    const tokens = await new GenerateAccessTokensCase(
      this.prismaService,
      this.jwtService,
    ).execute(user);

    await new UpdateUserAuthCase(this.prismaService).execute({
      refresh_token: tokens.refresh_token,
      id: user.id,
    });

    return tokens;
  }

  async logout(userId: string) {
    return await this.prismaService.usuario.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token: null,
      },
    });
  }

  async requestRecover(dto: RecoverDto) {
    const { email } = dto;

    const usuario_dados = await this.prismaService.usuario.findFirst({
      where: {
        email: email,
      },
    });

    if (!usuario_dados) {
      throw new BadRequestException('Email não cadastrado,procure o suporte ');
    }

    const tokenRecovery = new TokenRecovery();

    if (usuario_dados.senha_token && usuario_dados.senha_token !== 'false') {
      const verifyToken = tokenRecovery.verify(usuario_dados.senha_token);
      if (verifyToken.isValid) {
        throw new BadRequestException(
          'Já foi enviado um link de recuperação para seu email, verifique sua caixa de entrada ou spam.',
        );
      } else {
        await this.prismaService.usuario.update({
          data: {
            senha_token: '',
          },
          where: {
            id: usuario_dados.id,
          },
        });
      }
    }

    const token = tokenRecovery.create(email);

    try {
      await this.mailService.send(
        email,
        'Recuperação da conta ' + NAME_APLICATION,
        {
          name: usuario_dados.apelido,
          url: `${process.env.APP_URL_FRONT}resetar-senha?token=${token}`,
          year: new Date().getFullYear(),
        },
        'email-recover',
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error ao Enviar O Email');
    }

    await this.prismaService.usuario.update({
      data: {
        senha_token: token,
      },
      where: {
        id: usuario_dados.id,
      },
    });

    const message =
      'Se houver o cadastro será enviado um email de recuperação de senha para ' +
      email;

    const responseMessage = new ResponseMessage(message, null);

    return responseMessage;
  }

  async requestRecoverMobile(dto: RecoverDto) {
    const { email } = dto;

    const usuario_dados = await this.prismaService.usuario.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        apelido: true,
        email: true,
        senha_token: true,
      },
    });

    if (!usuario_dados) {
      throw new BadRequestException('Email não cadastrado, procure o suporte ');
    }

    const tokenRecovery = new TokenRecovery();

    if (usuario_dados.senha_token && usuario_dados.senha_token !== 'false') {
      const verifyToken = tokenRecovery.verify(usuario_dados.senha_token);
      if (verifyToken.isValid) {
        throw new BadRequestException(
          'Já foi enviado um link de recuperação para seu email.',
        );
      } else {
        await this.prismaService.usuario.update({
          data: {
            senha_token: '',
          },
          where: {
            id: usuario_dados.id,
          },
        });
      }
    }

    const MINUTES_EXPIRATION_TOKEN = 30;
    const { codigo, encrypted } = tokenRecovery.createCodigo(
      email,
      MINUTES_EXPIRATION_TOKEN,
    );

    try {
      await this.mailService.send(
        email,
        'Código de recuperação de senha - ' + NAME_APLICATION,
        {
          name: usuario_dados.apelido,
          code: codigo,
          year: new Date().getFullYear(),
        },
        'email-recover-mobile',
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao enviar o e-mail');
    }

    await this.prismaService.usuario.update({
      data: { senha_token: encrypted },
      where: { id: usuario_dados.id },
    });

    const responseMessage = new ResponseMessage('Sucesso', usuario_dados);

    return responseMessage;
  }

  async recover(changePasswordDto: ChangePasswordDto) {
    const { senha, token } = changePasswordDto;

    const user = await this.prismaService.usuario.findFirst({
      where: {
        senha_token: token,
      },
      select: {
        id: true,
        senha_token: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Token Inválido');
    }

    const tokenRecovery = new TokenRecovery();

    const { isValid } = tokenRecovery.verify(user.senha_token);

    if (!isValid) {
      await this.prismaService.usuario.update({
        data: {
          senha_token: 'false',
        },
        where: {
          id: user.id,
        },
      });

      throw new BadRequestException('Token Inválido');
    }

    const newPassword = await hashData(senha);

    await this.prismaService.usuario.update({
      data: {
        senha: newPassword,
        senha_token: 'false',
      },
      where: {
        id: user.id,
      },
    });

    const responseMessage = new ResponseMessage(
      'Senha recuperada com sucesso',
      null,
    );

    return responseMessage;
  }

  async verifyUser(data: { cpf: string }) {
    const cpfSemFormatacao = removeMaskedCPF(data.cpf);

    const user = await this.prismaService.usuario.findFirst({
      where: {
        cpf: cpfSemFormatacao,
        ativo: true,
      },
      select: {
        id: true,
        apelido: true,
        email: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Credenciais inválidas.');
    }

    return new ResponseMessage('Sucesso', user);
  }

  async verifyCodigoRecoveryMobile(email: string, codigoDigitado: string) {
    const usuario = await this.prismaService.usuario.findFirst({
      where: { email },
      select: { senha_token: true },
    });

    if (!usuario || !usuario.senha_token) {
      throw new BadRequestException('Token não encontrado');
    }

    const tokenRecovery = new TokenRecovery();
    const { data, isValid } = tokenRecovery.verify(usuario.senha_token);

    if (!isValid) {
      throw new BadRequestException('Código expirado');
    }

    if (data.codigo !== codigoDigitado) {
      throw new BadRequestException('Código inválido');
    }

    return new ResponseMessage('Código válido', { token: usuario.senha_token });
  }
}
