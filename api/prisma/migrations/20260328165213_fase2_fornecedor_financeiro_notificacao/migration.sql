-- CreateTable
CREATE TABLE "geladinho_yuri"."fornecedor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(150) NOT NULL,
    "cnpj" VARCHAR(14),
    "telefone" VARCHAR(20),
    "email" VARCHAR(100),
    "endereco" VARCHAR(255),
    "observacao" VARCHAR(500),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fornecedor_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."entrada_estoque" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fornecedor_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'rascunho',
    "nota_fiscal" VARCHAR(50),
    "data_emissao" TIMESTAMP(6),
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "observacao" VARCHAR(500),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,

    CONSTRAINT "entrada_estoque_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."item_entrada" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entrada_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "item_entrada_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."categoria_financeira" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cat_fin_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."conta_financeira" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo" VARCHAR(20) NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vencimento" TIMESTAMP(6) NOT NULL,
    "pago_em" TIMESTAMP(6),
    "forma_pagamento" VARCHAR(30),
    "categoria_financeira_id" UUID,
    "observacao" VARCHAR(500),
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "origem" VARCHAR(30) NOT NULL DEFAULT 'manual',
    "referencia_id" UUID,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "conta_fin_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."notificacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "mensagem" VARCHAR(500) NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "referencia_tipo" VARCHAR(50),
    "referencia_id" UUID,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forn_cnpj_un" ON "geladinho_yuri"."fornecedor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "cat_fin_nome_tipo_un" ON "geladinho_yuri"."categoria_financeira"("nome", "tipo");

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."entrada_estoque" ADD CONSTRAINT "ent_est_forn_fk" FOREIGN KEY ("fornecedor_id") REFERENCES "geladinho_yuri"."fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."item_entrada" ADD CONSTRAINT "item_ent_entrada_fk" FOREIGN KEY ("entrada_id") REFERENCES "geladinho_yuri"."entrada_estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."item_entrada" ADD CONSTRAINT "item_ent_prod_fk" FOREIGN KEY ("produto_id") REFERENCES "geladinho_yuri"."produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."conta_financeira" ADD CONSTRAINT "conta_fin_cat_fk" FOREIGN KEY ("categoria_financeira_id") REFERENCES "geladinho_yuri"."categoria_financeira"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."notificacao" ADD CONSTRAINT "notif_usuario_fk" FOREIGN KEY ("usuario_id") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
