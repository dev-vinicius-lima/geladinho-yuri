package com.viniciuslima.mobile.domain.usecase.produto

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDetalheResponseDto
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import javax.inject.Inject

class GetProdutoByIdUseCase @Inject constructor(
    private val repository: ProdutoRepository
) {
    suspend operator fun invoke(token: String, id: String): NetworkResult<ProdutoDetalheResponseDto> {
        return repository.findOne(token, id)
    }
}
