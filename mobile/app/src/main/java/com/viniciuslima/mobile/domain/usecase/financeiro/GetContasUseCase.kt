package com.viniciuslima.mobile.domain.usecase.financeiro

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.financeiro.ContaFinanceiraListResponseDto
import com.viniciuslima.mobile.domain.repository.FinanceiroRepository
import javax.inject.Inject

class GetContasUseCase @Inject constructor(
    private val repository: FinanceiroRepository
) {
    suspend operator fun invoke(
        token: String,
        tipo: String? = null,
        status: String? = null
    ): NetworkResult<ContaFinanceiraListResponseDto> {
        return repository.findAllContas(token, tipo, status)
    }
}
