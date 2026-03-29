package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDetalheResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoListResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.UpdateProdutoRequestDto

interface ProdutoRepository {
    suspend fun findAll(token: String): NetworkResult<ProdutoListResponseDto>
    suspend fun findOne(token: String, id: String): NetworkResult<ProdutoDetalheResponseDto>
    suspend fun create(token: String, dto: CreateProdutoRequestDto): NetworkResult<CreateProdutoResponseDto>
    suspend fun update(token: String, id: String, dto: UpdateProdutoRequestDto): NetworkResult<CreateProdutoResponseDto>
    suspend fun movimentarEstoque(token: String, id: String, dto: MovimentacaoEstoqueRequestDto): NetworkResult<MovimentacaoEstoqueResponseDto>
}
