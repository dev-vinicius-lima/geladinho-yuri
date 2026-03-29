package com.viniciuslima.mobile.domain.usecase.caixa

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.AbrirCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaOperacaoResponseDto
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import javax.inject.Inject

class AbrirCaixaUseCase @Inject constructor(
    private val repository: CaixaRepository
) {
    suspend operator fun invoke(token: String, valorAbertura: Double): NetworkResult<CaixaOperacaoResponseDto> {
        return repository.abrir(token, AbrirCaixaRequestDto(valor_abertura = valorAbertura))
    }
}
