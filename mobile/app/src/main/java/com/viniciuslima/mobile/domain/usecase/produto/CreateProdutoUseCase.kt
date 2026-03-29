package com.viniciuslima.mobile.domain.usecase.produto

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoResponseDto
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import javax.inject.Inject

class CreateProdutoUseCase @Inject constructor(
    private val repository: ProdutoRepository
) {
    suspend operator fun invoke(token: String, dto: CreateProdutoRequestDto): NetworkResult<CreateProdutoResponseDto> {
        return repository.create(token, dto)
    }
}
