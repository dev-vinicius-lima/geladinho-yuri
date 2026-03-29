package com.viniciuslima.mobile.data.remote.dto.produto

data class CreateProdutoRequestDto(
    val nome: String,
    val preco: Double,
    val quantidade: Int,
    val categoria_id: String,
    val descricao: String? = null,
    val codigo: String? = null,
    val unidade: String? = null,
    val preco_custo: Double? = null,
    val estoque_minimo: Int? = null,
)

data class UpdateProdutoRequestDto(
    val nome: String? = null,
    val preco: Double? = null,
    val categoria_id: String? = null,
    val descricao: String? = null,
    val codigo: String? = null,
    val unidade: String? = null,
    val preco_custo: Double? = null,
    val estoque_minimo: Int? = null,
)

data class ProdutoDetalheResponseDto(
    val message: String,
    val data: ProdutoDetalheDto
)

data class ProdutoDetalheDto(
    val id: String,
    val nome: String,
    val descricao: String?,
    val codigo: String?,
    val unidade: String?,
    val preco: Double,
    val preco_custo: Double?,
    val quantidade: Int,
    val estoque_minimo: Int?,
    val categoria: CategoriaDto,
)

data class CreateProdutoResponseDto(
    val message: String,
    val data: ProdutoDetalheDto
)

data class MovimentacaoEstoqueRequestDto(
    val tipo: String,       // "entrada" | "saida" | "ajuste"
    val quantidade: Int,
    val descricao: String? = null,
)

data class MovimentacaoEstoqueResponseDto(
    val message: String,
)
