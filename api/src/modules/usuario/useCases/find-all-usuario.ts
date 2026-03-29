import { PrismaService } from 'src/database/prisma.service';
import { ResponsePagination } from 'src/common/message/response-pagination';

export class FindAllUsuarioCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { search?: string; page: number; pageSize: number }) {
    const { search, page, pageSize } = params;
    const pageNum = page + 1;
    const take = pageSize;
    const skip = (pageNum - 1) * take;

    const where: any = { ativo: true };
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { apelido: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const select = {
      id: true,
      nome: true,
      apelido: true,
      cpf: true,
      email: true,
      telefone: true,
      administrador: true,
      imagem: true,
      ativo: true,
      criado_em: true,
      ultimo_acesso_em: true,
      usuario_perfil_usuario_perfil_usuario_idTousuario: {
        select: {
          perfil: { select: { id: true, nome: true, identificador: true } },
        },
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({ where, take, skip, orderBy: { nome: 'asc' }, select }),
      this.prisma.usuario.count({ where }),
    ]);

    const formatted = data.map((u) => ({
      ...u,
      perfis: u.usuario_perfil_usuario_perfil_usuario_idTousuario.map((up) => up.perfil),
      usuario_perfil_usuario_perfil_usuario_idTousuario: undefined,
    }));

    return new ResponsePagination({
      message: 'Sucesso',
      data: formatted,
      take,
      page: pageNum,
      totalItems: total,
    });
  }
}
