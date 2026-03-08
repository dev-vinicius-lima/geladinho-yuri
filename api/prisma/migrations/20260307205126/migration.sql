-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "geladinho_yuri";

-- CreateTable
CREATE TABLE "geladinho_yuri"."operacao" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tela_id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "nome_curto" VARCHAR(50) NOT NULL,
    "url" VARCHAR(50) NOT NULL,
    "icone" VARCHAR(45) NOT NULL,
    "descricao" VARCHAR(200),
    "target" BOOLEAN DEFAULT false,
    "tabela" BOOLEAN,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" UUID,

    CONSTRAINT "operacao_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."perfil" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(30) NOT NULL,
    "identificador" VARCHAR(20) NOT NULL,
    "administrador" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "perfil_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."perfil_operacao_tela" (
    "perfil_id" UUID NOT NULL,
    "operacao_id" UUID NOT NULL,
    "tela_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."tela" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tela_pai_id" UUID,
    "nome" VARCHAR(100) NOT NULL,
    "icone" VARCHAR(45) NOT NULL,
    "url" VARCHAR(50) NOT NULL,
    "administrador" BOOLEAN NOT NULL DEFAULT false,
    "menu" BOOLEAN NOT NULL DEFAULT false,
    "descricao" VARCHAR(255),
    "ordem" INTEGER,
    "padrao_cor" JSONB,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tela_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."usuario" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255),
    "codigo_validacao" VARCHAR(50),
    "apelido" VARCHAR(100),
    "cpf" VARCHAR(11) NOT NULL,
    "senha" VARCHAR(255),
    "email" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(11),
    "senha_redefinir" BOOLEAN NOT NULL DEFAULT false,
    "senha_token" VARCHAR(255) NOT NULL DEFAULT false,
    "refresh_token" VARCHAR(255),
    "lembrete" VARCHAR(100),
    "conexao_id" INTEGER,
    "ultimo_acesso_ip" VARCHAR(30),
    "ultimo_acesso_em" TIMESTAMP(6),
    "imagem" VARCHAR(255),
    "administrador" BOOLEAN NOT NULL DEFAULT false,
    "credencial_externa" JSONB,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuario_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."usuario_perfil" (
    "usuario_id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID
);

-- CreateIndex
CREATE UNIQUE INDEX "oper_tela_nome_curto_un" ON "geladinho_yuri"."operacao"("tela_id", "nome_curto");

-- CreateIndex
CREATE UNIQUE INDEX "oper_tela_nome_un" ON "geladinho_yuri"."operacao"("tela_id", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "oper_tela_url_un" ON "geladinho_yuri"."operacao"("tela_id", "url");

-- CreateIndex
CREATE UNIQUE INDEX "perf_nome_un" ON "geladinho_yuri"."perfil"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "perf_identificador_un" ON "geladinho_yuri"."perfil"("identificador");

-- CreateIndex
CREATE UNIQUE INDEX "perf_ope_tel_un" ON "geladinho_yuri"."perfil_operacao_tela"("perfil_id", "operacao_id", "tela_id");

-- CreateIndex
CREATE UNIQUE INDEX "tela_nome_un" ON "geladinho_yuri"."tela"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tela_url_un" ON "geladinho_yuri"."tela"("url");

-- CreateIndex
CREATE UNIQUE INDEX "usua_cpf_un" ON "geladinho_yuri"."usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usua_refresh_token_un" ON "geladinho_yuri"."usuario"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "usua_per_un" ON "geladinho_yuri"."usuario_perfil"("usuario_id", "perfil_id");

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."operacao" ADD CONSTRAINT "oper_atualizado_por_fk" FOREIGN KEY ("atualizado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."operacao" ADD CONSTRAINT "oper_criado_por_fk" FOREIGN KEY ("criado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."operacao" ADD CONSTRAINT "oper_tela_fk" FOREIGN KEY ("tela_id") REFERENCES "geladinho_yuri"."tela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."operacao" ADD CONSTRAINT "operacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."perfil" ADD CONSTRAINT "perf_atualizado_por_fk" FOREIGN KEY ("atualizado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."perfil" ADD CONSTRAINT "perf_criado_por_fk" FOREIGN KEY ("criado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."perfil_operacao_tela" ADD CONSTRAINT "perf_ope_tel_operacao_fk" FOREIGN KEY ("operacao_id") REFERENCES "geladinho_yuri"."operacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."perfil_operacao_tela" ADD CONSTRAINT "perf_ope_tel_perfil_fk" FOREIGN KEY ("perfil_id") REFERENCES "geladinho_yuri"."perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."perfil_operacao_tela" ADD CONSTRAINT "perf_tel_tel_criado_por_fk" FOREIGN KEY ("criado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."perfil_operacao_tela" ADD CONSTRAINT "perf_tel_tel_tela_fk" FOREIGN KEY ("tela_id") REFERENCES "geladinho_yuri"."tela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."tela" ADD CONSTRAINT "tela_atualizado_por_fk" FOREIGN KEY ("atualizado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."tela" ADD CONSTRAINT "tela_criado_por_fk" FOREIGN KEY ("criado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."tela" ADD CONSTRAINT "tela_pai_fk" FOREIGN KEY ("tela_pai_id") REFERENCES "geladinho_yuri"."tela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."usuario" ADD CONSTRAINT "usua_atualizado_por_fk" FOREIGN KEY ("atualizado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."usuario" ADD CONSTRAINT "usua_criado_por_fk" FOREIGN KEY ("criado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."usuario_perfil" ADD CONSTRAINT "usua_per_criado_por_fk" FOREIGN KEY ("criado_por") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."usuario_perfil" ADD CONSTRAINT "usua_per_perfil_fk" FOREIGN KEY ("perfil_id") REFERENCES "geladinho_yuri"."perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."usuario_perfil" ADD CONSTRAINT "usua_per_usuario_fk" FOREIGN KEY ("usuario_id") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
