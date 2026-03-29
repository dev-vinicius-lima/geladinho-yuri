package com.viniciuslima.mobile.data.remote.dto.caixa

// =============================================================================
// Request DTOs — corpo das chamadas à API
// =============================================================================

data class AbrirCaixaRequestDto(
    val valor_abertura: Double
)

data class FecharCaixaRequestDto(
    val valor_fechamento: Double
)

data class SangriaRequestDto(
    val valor: Double,
    val descricao: String? = null
)

data class SuprimentoRequestDto(
    val valor: Double,
    val descricao: String? = null
)

// =============================================================================
// Response DTOs — dados retornados pela API
// =============================================================================

// Caixa aberto (GET /caixa/aberto)
data class CaixaAbertoDto(
    val id: String,
    val status: String,          // "aberto" | "fechado"
    val valor_abertura: Double,
    val saldo_esperado: Double?,
    val aberto_em: String,
    val usuario_id: String
)

// Wrapper para GET /caixa/aberto — data pode ser null (sem caixa aberto)
data class CaixaAbertoResponseDto(
    val message: String,
    val data: CaixaAbertoDto?
)

// Resultado do fechamento do caixa
data class FecharCaixaDataDto(
    val id: String,
    val status: String,
    val valor_abertura: Double,
    val valor_fechamento: Double,
    val saldo_esperado: Double,
    val diferenca: Double,
    val fechado_em: String
)

data class FecharCaixaResponseDto(
    val message: String,
    val data: FecharCaixaDataDto
)

// Resposta genérica para abrir, sangria e suprimento
data class CaixaOperacaoResponseDto(
    val message: String,
    val data: CaixaAbertoDto
)
