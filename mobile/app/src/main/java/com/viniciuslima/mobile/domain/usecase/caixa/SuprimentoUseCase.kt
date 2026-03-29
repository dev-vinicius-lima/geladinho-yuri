package com.viniciuslima.mobile.domain.usecase.caixa

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaOperacaoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SuprimentoRequestDto
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import javax.inject.Inject

class SuprimentoUseCase @Inject constructor(
    private val repository: CaixaRepository
) {
    suspend operator fun invoke(
        token: String,
        caixaId: String,
        valor: Double,
        descricao: String? = null
    ): NetworkResult<CaixaOperacaoResponseDto> {
        return repository.suprimento(token, caixaId, SuprimentoRequestDto(valor = valor, descricao = descricao))
    }
}
