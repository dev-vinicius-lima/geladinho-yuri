-- CreateTable
CREATE TABLE "geladinho_yuri"."categoria_produto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(50) NOT NULL,
    "descricao" VARCHAR(200),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categoria_produto_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."produto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(255),
    "codigo" VARCHAR(50),
    "unidade" VARCHAR(20) NOT NULL DEFAULT 'un',
    "preco" DECIMAL(10,2) NOT NULL,
    "preco_custo" DECIMAL(10,2),
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "estoque_minimo" INTEGER NOT NULL DEFAULT 0,
    "categoria_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),
    "criado_por" UUID,
    "atualizado_por" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produto_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."movimentacao_estoque" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "produto_id" UUID NOT NULL,
    "venda_id" UUID,
    "tipo" VARCHAR(20) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "descricao" VARCHAR(200),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,

    CONSTRAINT "mov_estoque_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."caixa" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aberto',
    "valor_abertura" DECIMAL(10,2) NOT NULL,
    "valor_fechamento" DECIMAL(10,2),
    "total_vendas" DECIMAL(10,2),
    "total_sangrias" DECIMAL(10,2),
    "total_suprimentos" DECIMAL(10,2),
    "saldo_esperado" DECIMAL(10,2),
    "diferenca" DECIMAL(10,2),
    "aberto_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechado_em" TIMESTAMP(6),
    "observacao" VARCHAR(500),
    "criado_por" UUID,

    CONSTRAINT "caixa_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."movimentacao_caixa" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caixa_id" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" VARCHAR(200),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,

    CONSTRAINT "mov_caixa_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."venda" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "caixa_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'concluida',
    "forma_pagamento" VARCHAR(30) NOT NULL DEFAULT 'dinheiro',
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_recebido" DECIMAL(10,2),
    "troco" DECIMAL(10,2),
    "observacao" VARCHAR(255),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6),

    CONSTRAINT "venda_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geladinho_yuri"."item_venda" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venda_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "item_venda_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_prod_nome_un" ON "geladinho_yuri"."categoria_produto"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "prod_codigo_un" ON "geladinho_yuri"."produto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "prod_nome_cat_un" ON "geladinho_yuri"."produto"("nome", "categoria_id");

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."produto" ADD CONSTRAINT "prod_cat_fk" FOREIGN KEY ("categoria_id") REFERENCES "geladinho_yuri"."categoria_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."movimentacao_estoque" ADD CONSTRAINT "mov_prod_fk" FOREIGN KEY ("produto_id") REFERENCES "geladinho_yuri"."produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."movimentacao_estoque" ADD CONSTRAINT "mov_venda_fk" FOREIGN KEY ("venda_id") REFERENCES "geladinho_yuri"."venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."caixa" ADD CONSTRAINT "caixa_usuario_fk" FOREIGN KEY ("usuario_id") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."movimentacao_caixa" ADD CONSTRAINT "mov_caixa_fk" FOREIGN KEY ("caixa_id") REFERENCES "geladinho_yuri"."caixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."venda" ADD CONSTRAINT "venda_usuario_fk" FOREIGN KEY ("usuario_id") REFERENCES "geladinho_yuri"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."venda" ADD CONSTRAINT "venda_caixa_fk" FOREIGN KEY ("caixa_id") REFERENCES "geladinho_yuri"."caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."item_venda" ADD CONSTRAINT "item_prod_fk" FOREIGN KEY ("produto_id") REFERENCES "geladinho_yuri"."produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geladinho_yuri"."item_venda" ADD CONSTRAINT "item_venda_fk" FOREIGN KEY ("venda_id") REFERENCES "geladinho_yuri"."venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
