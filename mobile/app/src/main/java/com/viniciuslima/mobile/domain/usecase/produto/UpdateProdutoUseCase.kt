package com.viniciuslima.mobile.domain.usecase.produto

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoResponseDto
import com.viniciuslima.mobile.data.remote.dto.produto.UpdateProdutoRequestDto
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import javax.inject.Inject

class UpdateProdutoUseCase @Inject constructor(
    private val repository: ProdutoRepository
) {
    suspend operator fun invoke(token: String, id: String, dto: UpdateProdutoRequestDto): NetworkResult<CreateProdutoResponseDto> {
        return repository.update(token, id, dto)
    }
}
