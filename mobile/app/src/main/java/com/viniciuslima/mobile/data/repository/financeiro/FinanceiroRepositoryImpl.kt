package com.viniciuslima.mobile.data.repository.financeiro

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.financeiro.FinanceiroApi
import com.viniciuslima.mobile.data.remote.dto.financeiro.ContaFinanceiraListResponseDto
import com.viniciuslima.mobile.data.remote.dto.financeiro.ResumoFinanceiroResponseDto
import com.viniciuslima.mobile.domain.repository.FinanceiroRepository
import javax.inject.Inject

class FinanceiroRepositoryImpl @Inject constructor(
    private val api: FinanceiroApi
) : FinanceiroRepository {

    override suspend fun resumo(token: String): NetworkResult<ResumoFinanceiroResponseDto> {
        return safeApiCall { api.resumo("Bearer $token") }
    }

    override suspend fun findAllContas(
        token: String,
        tipo: String?,
        status: String?
    ): NetworkResult<ContaFinanceiraListResponseDto> {
        return safeApiCall { api.findAllContas("Bearer $token", tipo = tipo, status = status) }
    }
}
