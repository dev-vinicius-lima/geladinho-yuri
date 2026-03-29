package com.viniciuslima.mobile.data.remote.api.produto

import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDetalheResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoListResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.UpdateProdutoRequestDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface ProdutoApi {

    @GET("produto")
    suspend fun findAll(
        @Header("Authorization") token: String
    ): Response<ProdutoListResponseDto>

    @GET("produto/{id}")
    suspend fun findOne(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<ProdutoDetalheResponseDto>

    @POST("produto")
    suspend fun create(
        @Header("Authorization") token: String,
        @Body dto: CreateProdutoRequestDto
    ): Response<CreateProdutoResponseDto>

    @PATCH("produto/{id}")
    suspend fun update(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body dto: UpdateProdutoRequestDto
    ): Response<CreateProdutoResponseDto>

    @POST("produto/{id}/movimentacao")
    suspend fun movimentarEstoque(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body dto: MovimentacaoEstoqueRequestDto
    ): Response<MovimentacaoEstoqueResponseDto>
}
