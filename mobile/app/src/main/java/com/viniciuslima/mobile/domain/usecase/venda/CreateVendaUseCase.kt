package com.viniciuslima.mobile.domain.usecase.venda

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaDto
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaResponseDto
import com.viniciuslima.mobile.domain.repository.VendaRepository
import javax.inject.Inject

class CreateVendaUseCase @Inject constructor(
    private val repository: VendaRepository
) {
    suspend operator fun invoke(token: String, dto: CreateVendaDto): NetworkResult<CreateVendaResponseDto> {
        return repository.create(token, dto)
    }
}
