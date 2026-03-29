package com.viniciuslima.mobile.domain.usecase.categoria

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.categoria.CategoriaListResponseDto
import com.viniciuslima.mobile.domain.repository.CategoriaRepository
import javax.inject.Inject

class GetCategoriasUseCase @Inject constructor(
    private val repository: CategoriaRepository
) {
    suspend operator fun invoke(token: String): NetworkResult<CategoriaListResponseDto> {
        return repository.findAll(token)
    }
}
