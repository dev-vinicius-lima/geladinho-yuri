package com.viniciuslima.mobile.data.repository.produto

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.produto.ProdutoApi
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDetalheResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoListResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.UpdateProdutoRequestDto
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import javax.inject.Inject

class ProdutoRepositoryImpl @Inject constructor(
    private val api: ProdutoApi
) : ProdutoRepository {

    override suspend fun findAll(token: String): NetworkResult<ProdutoListResponseDto> {
        return safeApiCall { api.findAll("Bearer $token") }
    }

    override suspend fun findOne(token: String, id: String): NetworkResult<ProdutoDetalheResponseDto> {
        return safeApiCall { api.findOne("Bearer $token", id) }
    }

    override suspend fun create(token: String, dto: CreateProdutoRequestDto): NetworkResult<CreateProdutoResponseDto> {
        return safeApiCall { api.create("Bearer $token", dto) }
    }

    override suspend fun update(token: String, id: String, dto: UpdateProdutoRequestDto): NetworkResult<CreateProdutoResponseDto> {
        return safeApiCall { api.update("Bearer $token", id, dto) }
    }

    override suspend fun movimentarEstoque(token: String, id: String, dto: MovimentacaoEstoqueRequestDto): NetworkResult<MovimentacaoEstoqueResponseDto> {
        return safeApiCall { api.movimentarEstoque("Bearer $token", id, dto) }
    }
}
