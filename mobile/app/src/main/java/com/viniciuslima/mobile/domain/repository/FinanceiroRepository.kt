package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.financeiro.ContaFinanceiraListResponseDto
import com.viniciuslima.mobile.data.remote.dto.financeiro.ResumoFinanceiroResponseDto

interface FinanceiroRepository {
    suspend fun resumo(token: String): NetworkResult<ResumoFinanceiroResponseDto>
    suspend fun findAllContas(token: String, tipo: String? = null, status: String? = null): NetworkResult<ContaFinanceiraListResponseDto>
}
