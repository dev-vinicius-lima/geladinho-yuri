package com.viniciuslima.mobile.domain.usecase.caixa

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaResponseDto
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import javax.inject.Inject

class FecharCaixaUseCase @Inject constructor(
    private val repository: CaixaRepository
) {
    suspend operator fun invoke(
        token: String,
        caixaId: String,
        valorFechamento: Double
    ): NetworkResult<FecharCaixaResponseDto> {
        return repository.fechar(token, caixaId, FecharCaixaRequestDto(valor_fechamento = valorFechamento))
    }
}
