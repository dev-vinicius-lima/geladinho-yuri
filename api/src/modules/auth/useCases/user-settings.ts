import { PrismaService } from 'src/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

type UserType = Awaited<ReturnType<UserSettingsCase['getUser']>>;

class UserSettingsCase {
  private readonly prismaService: PrismaService;
  private user!: UserType;

  constructor(prismaService: PrismaService) {
    this.prismaService = prismaService;
  }

  async execute(userId: string, isAdminToken?: boolean) {
    this.user = await this.getUser(userId);

    const permissions = await this.permissions();

    const formatUser = {
      ...this.user,
      administrador:
        isAdminToken != undefined ? isAdminToken : this.user.administrador,
      grupo_acesso: permissions.perfis.length > 0 || this.user.administrador,
    };

    return { user: formatUser, ...permissions };
  }

  private async permissions() {
    const userId = this.user.id;

    const isUserAdmin = this.user.administrador ? undefined : false;

    const userPerfis = await this.prismaService.perfil.findMany({
      where: {
        usuario_perfil: {
          some: {
            usuario_id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (userPerfis.length === 0 && !this.user.administrador) {
      return {
        perfis: [],
        permissions: [],
      };
    }

    const userPerfilIds = userPerfis.map((item) => {
      return item.id;
    });

    const perfilOperacao = {
      perfil_operacao_tela: {
        some: {
          perfil_id: {
            in: userPerfilIds,
          },
        },
      },
    };

    const objectWhereTela = {
      operacao: {
        some: {
          ...perfilOperacao,
        },
      },
    };

    const ObjectWhere = this.user.administrador
      ? {
          operacao: {
            some: {},
          },
        }
      : objectWhereTela;

    const ObjectWherePerfilOperacao = this.user.administrador
      ? {}
      : perfilOperacao;

    const telaAndOperations = await this.prismaService.tela.findMany({
      select: {
        url: true,
        icone: true,
        nome: true,
        operacao: {
          select: {
            nome: true,
            icone: true,
            url: true,
            nome_curto: true,
            tabela: true,
          },
          where: {
            ativo: true,
            ...ObjectWherePerfilOperacao,
          },
        },
      },
      where: {
        ativo: true,
        administrador: isUserAdmin,
        ...ObjectWhere,
      },
    });

    return {
      perfis: userPerfilIds,
      permissions: telaAndOperations,
    };
  }

  private async getUser(userId: string) {
    const usuario = await this.prismaService.usuario.findUnique({
      select: {
        id: true,
        administrador: true,
        apelido: true,
        ativo: true,
        email: true,
      },
      where: {
        id: userId,
      },
    });

    if (!usuario) {
      throw new BadRequestException('erro');
    }

    return {
      ...usuario,
    };
  }
}

export { UserSettingsCase };
