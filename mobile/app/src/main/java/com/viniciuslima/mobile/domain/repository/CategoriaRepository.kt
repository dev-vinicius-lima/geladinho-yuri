package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.categoria.CategoriaListResponseDto

interface CategoriaRepository {
    suspend fun findAll(token: String): NetworkResult<CategoriaListResponseDto>
}
