package com.viniciuslima.mobile.domain.usecase.caixa

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaOperacaoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SangriaRequestDto
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import javax.inject.Inject

class SangriaUseCase @Inject constructor(
    private val repository: CaixaRepository
) {
    suspend operator fun invoke(
        token: String,
        caixaId: String,
        valor: Double,
        descricao: String? = null
    ): NetworkResult<CaixaOperacaoResponseDto> {
        return repository.sangria(token, caixaId, SangriaRequestDto(valor = valor, descricao = descricao))
    }
}
