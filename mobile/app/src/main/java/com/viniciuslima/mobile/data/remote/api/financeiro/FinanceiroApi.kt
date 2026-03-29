package com.viniciuslima.mobile.data.remote.api.financeiro

import com.viniciuslima.mobile.data.remote.dto.financeiro.ContaFinanceiraListResponseDto
import com.viniciuslima.mobile.data.remote.dto.financeiro.ResumoFinanceiroResponseDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface FinanceiroApi {

    @GET("financeiro/resumo")
    suspend fun resumo(
        @Header("Authorization") token: String
    ): Response<ResumoFinanceiroResponseDto>

    @GET("financeiro/contas")
    suspend fun findAllContas(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 0,
        @Query("pageSize") pageSize: Int = 20,
        @Query("tipo") tipo: String? = null,
        @Query("status") status: String? = null,
    ): Response<ContaFinanceiraListResponseDto>
}
