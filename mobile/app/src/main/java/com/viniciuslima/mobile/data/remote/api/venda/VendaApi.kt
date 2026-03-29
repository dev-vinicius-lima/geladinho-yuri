package com.viniciuslima.mobile.data.remote.api.venda

import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaDto
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaResponseDto
import com.viniciuslima.mobile.data.remote.dto.venda.DashboardResponseDto
import com.viniciuslima.mobile.data.remote.dto.venda.VendasRecentesResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface VendaApi {
    @POST("venda")
    suspend fun create(
        @Header("Authorization") token: String,
        @Body dto: CreateVendaDto
    ): Response<CreateVendaResponseDto>

    @GET("venda/dashboard")
    suspend fun getDashboard(
        @Header("Authorization") token: String
    ): Response<DashboardResponseDto>

    @GET("venda/recentes")
    suspend fun getRecentes(
        @Header("Authorization") token: String
    ): Response<VendasRecentesResponseDto>
}
