import { usuario } from 'generated/prisma';
import { PrismaService } from 'src/database/prisma.service';

class UpdateUserAuthCase {
  prismaService: PrismaService;
  constructor(prismaService: PrismaService) {
    this.prismaService = prismaService;
  }
  async execute(
    user: Partial<Pick<usuario, 'refresh_token' | 'ultimo_acesso_ip'>> & {
      id: string;
    },
    isNotUltimoAcesso?: boolean,
  ) {
    const { refresh_token, ultimo_acesso_ip, id } = user;
    return await this.prismaService.usuario.update({
      data: {
        refresh_token: refresh_token || undefined,
        ultimo_acesso_em: isNotUltimoAcesso ? undefined : new Date(),
        ultimo_acesso_ip: ultimo_acesso_ip || undefined,
      },
      where: {
        id: id,
      },
    });
  }
}
export { UpdateUserAuthCase };
