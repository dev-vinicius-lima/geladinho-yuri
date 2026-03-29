package com.viniciuslima.mobile.domain.usecase.produto

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoListResponseDto
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import javax.inject.Inject

class GetProdutosUseCase @Inject constructor(
    private val repository: ProdutoRepository
) {
    suspend operator fun invoke(token: String): NetworkResult<ProdutoListResponseDto> {
        return repository.findAll(token)
    }
}
