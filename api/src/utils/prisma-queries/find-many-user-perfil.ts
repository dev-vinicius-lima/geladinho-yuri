import { PrismaService } from 'src/database/prisma.service';

class FindManyUserPerfil {
  prismaService: PrismaService;

  constructor(prismaService: PrismaService) {
    this.prismaService = prismaService;
  }

  async execute(userId: string) {
    const usuarioPerfil = await this.prismaService.usuario_perfil.findMany({
      where: {
        usuario_id: userId,
        perfil: {
          ativo: true,
        },
      },
    });

    const perfilId = usuarioPerfil.map((up) => up.perfil_id);

    return perfilId;
  }
}

export { FindManyUserPerfil };
