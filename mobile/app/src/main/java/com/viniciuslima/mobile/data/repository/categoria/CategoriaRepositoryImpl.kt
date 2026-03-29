package com.viniciuslima.mobile.data.repository.categoria

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.categoria.CategoriaApi
import com.viniciuslima.mobile.data.remote.dto.categoria.CategoriaListResponseDto
import com.viniciuslima.mobile.domain.repository.CategoriaRepository
import javax.inject.Inject

class CategoriaRepositoryImpl @Inject constructor(
    private val api: CategoriaApi
) : CategoriaRepository {

    override suspend fun findAll(token: String): NetworkResult<CategoriaListResponseDto> {
        return safeApiCall { api.findAll("Bearer $token") }
    }
}
