package com.viniciuslima.mobile.domain.usecase.venda

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.venda.VendasRecentesResponseDto
import com.viniciuslima.mobile.domain.repository.VendaRepository
import javax.inject.Inject

class GetVendasRecentesUseCase @Inject constructor(
    private val repository: VendaRepository
) {
    suspend operator fun invoke(token: String): NetworkResult<VendasRecentesResponseDto> {
        return repository.getRecentes(token)
    }
}
