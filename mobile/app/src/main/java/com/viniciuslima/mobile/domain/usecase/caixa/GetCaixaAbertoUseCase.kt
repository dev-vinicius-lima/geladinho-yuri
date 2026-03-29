package com.viniciuslima.mobile.domain.usecase.caixa

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaAbertoResponseDto
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import javax.inject.Inject

class GetCaixaAbertoUseCase @Inject constructor(
    private val repository: CaixaRepository
) {
    suspend operator fun invoke(token: String): NetworkResult<CaixaAbertoResponseDto> {
        return repository.getAberto(token)
    }
}
