package com.viniciuslima.mobile.data.remote.dto.venda

data class ItemVendaResponseDto(
    val id: String,
    val produto_id: String,
    val quantidade: Int,
    val preco_unitario: Double,
    val produto: ProdutoResumoDto
)

data class ProdutoResumoDto(
    val nome: String
)

data class VendaResponseDto(
    val id: String,
    val usuario_id: String,
    val criado_em: String,
    val itens: List<ItemVendaResponseDto>
)

data class CreateVendaResponseDto(
    val message: String,
    val data: VendaResponseDto
)
