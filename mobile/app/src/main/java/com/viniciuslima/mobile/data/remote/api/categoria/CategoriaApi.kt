package com.viniciuslima.mobile.data.remote.api.categoria

import com.viniciuslima.mobile.data.remote.dto.categoria.CategoriaListResponseDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header

interface CategoriaApi {
    @GET("categoria-produto")
    suspend fun findAll(
        @Header("Authorization") token: String
    ): Response<CategoriaListResponseDto>
}
