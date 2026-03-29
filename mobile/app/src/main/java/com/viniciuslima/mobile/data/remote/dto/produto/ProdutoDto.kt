package com.viniciuslima.mobile.data.remote.dto.produto

data class CategoriaDto(
    val id: String,
    val nome: String
)

data class ProdutoDto(
    val id: String,
    val nome: String,
    val descricao: String?,
    val preco: Double,
    val quantidade: Int,
    val estoque_minimo: Int?,
    val categoria: CategoriaDto
)

data class ProdutoListResponseDto(
    val message: String,
    val data: List<ProdutoDto>
)
