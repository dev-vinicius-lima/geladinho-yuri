package com.viniciuslima.mobile.data.remote.dto.financeiro

data class ResumoFinanceiroDto(
    val total_a_receber: Double,
    val total_a_pagar: Double,
    val saldo_projetado: Double,
    val contas_vencidas_count: Int,
)

data class ResumoFinanceiroResponseDto(
    val message: String,
    val data: ResumoFinanceiroDto,
)

data class ContaFinanceiraDto(
    val id: String,
    val descricao: String,
    val valor: Double,
    val tipo: String,       // "pagar" ou "receber"
    val status: String,     // "pendente", "paga", "vencida"
    val vencimento: String,
    val pago_em: String?,
)

data class ContaFinanceiraListResponseDto(
    val message: String,
    val data: List<ContaFinanceiraDto>,
)
