package com.viniciuslima.mobile.data.repository.venda

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.venda.VendaApi
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaDto
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaResponseDto
import com.viniciuslima.mobile.data.remote.dto.venda.DashboardResponseDto
import com.viniciuslima.mobile.data.remote.dto.venda.VendasRecentesResponseDto
import com.viniciuslima.mobile.domain.repository.VendaRepository
import javax.inject.Inject

class VendaRepositoryImpl @Inject constructor(
    private val api: VendaApi
) : VendaRepository {
    override suspend fun create(token: String, dto: CreateVendaDto): NetworkResult<CreateVendaResponseDto> {
        return safeApiCall { api.create("Bearer $token", dto) }
    }

    override suspend fun getDashboard(token: String): NetworkResult<DashboardResponseDto> {
        return safeApiCall { api.getDashboard("Bearer $token") }
    }

    override suspend fun getRecentes(token: String): NetworkResult<VendasRecentesResponseDto> {
        return safeApiCall { api.getRecentes("Bearer $token") }
    }
}
