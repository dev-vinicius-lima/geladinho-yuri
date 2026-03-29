package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaDto
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaResponseDto
import com.viniciuslima.mobile.data.remote.dto.venda.DashboardResponseDto
import com.viniciuslima.mobile.data.remote.dto.venda.VendasRecentesResponseDto

interface VendaRepository {
    suspend fun create(token: String, dto: CreateVendaDto): NetworkResult<CreateVendaResponseDto>
    suspend fun getDashboard(token: String): NetworkResult<DashboardResponseDto>
    suspend fun getRecentes(token: String): NetworkResult<VendasRecentesResponseDto>
}
