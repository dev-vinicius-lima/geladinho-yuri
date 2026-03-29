import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ─── Usuário administrador ────────────────────────────────────────────────

  const cpf = '02516496281';
  const senhaHash = await bcrypt.hash('123456', 10);

  const usuario = await prisma.usuario.upsert({
    where: { cpf },
    update: {},
    create: {
      cpf,
      nome: 'Administrador',
      apelido: 'Admin',
      email: 'admin@geladinhoyuri.com',
      senha: senhaHash,
      administrador: true,
      senha_redefinir: false,
      ativo: true,
    },
  });

  console.log(`✓ Usuário seed: ${usuario.cpf} (${usuario.nome})`);

  // ─── Categorias de produto ────────────────────────────────────────────────

  const categorias = [
    {
      nome: 'Geladinho',
      descricao: 'Geladinhos artesanais de todos os sabores',
    },
    {
      nome: 'Insumos',
      descricao: 'Matéria-prima para produção dos geladinhos',
    },
  ];

  const categoriasMap: Record<string, string> = {};

  for (const cat of categorias) {
    const registro = await prisma.categoria_produto.upsert({
      where: { nome: cat.nome },
      update: {},
      create: { ...cat, ativo: true },
    });
    categoriasMap[cat.nome] = registro.id;
    console.log(`✓ Categoria: ${registro.nome}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
