package com.viniciuslima.mobile.data.remote.dto.venda

data class VendasHojeDto(
    val total: Double,
    val quantidade: Int,
    val ticket_medio: Double
)

data class CaixaAbertoDto(
    val id: String,
    val valor_abertura: Double,
    val aberto_em: String
)

data class DashboardDataDto(
    val caixa_aberto: CaixaAbertoDto?,
    val vendas_hoje: VendasHojeDto,
    val estoque_critico_count: Int
)

data class DashboardResponseDto(
    val message: String,
    val data: DashboardDataDto
)

data class VendaRecenteDto(
    val id: String,
    val total: Double,
    val forma_pagamento: String,
    val status: String,
    val criado_em: String,
    val itens: List<ItemVendaRecenteDto>,
    val usuario: UsuarioResumoDto?
)

data class ItemVendaRecenteDto(
    val quantidade: Int,
    val subtotal: Double,
    val produto: ProdutoResumoVendaDto
)

data class ProdutoResumoVendaDto(
    val nome: String
)

data class UsuarioResumoDto(
    val apelido: String?
)

data class VendasRecentesResponseDto(
    val message: String,
    val data: List<VendaRecenteDto>
)
