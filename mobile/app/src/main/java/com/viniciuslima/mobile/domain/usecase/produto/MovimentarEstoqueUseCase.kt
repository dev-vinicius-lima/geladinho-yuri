package com.viniciuslima.mobile.domain.usecase.produto

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.MovimentacaoEstoqueResponseDto
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import javax.inject.Inject

class MovimentarEstoqueUseCase @Inject constructor(
    private val repository: ProdutoRepository
) {
    suspend operator fun invoke(
        token: String,
        produtoId: String,
        novaQuantidade: Int,
        quantidadeAtual: Int,
    ): NetworkResult<MovimentacaoEstoqueResponseDto> {
        val delta = novaQuantidade - quantidadeAtual
        val tipo = when {
            delta > 0 -> "entrada"
            delta < 0 -> "saida"
            else -> "ajuste"
        }
        return repository.movimentarEstoque(
            token, produtoId,
            MovimentacaoEstoqueRequestDto(
                tipo = tipo,
                quantidade = Math.abs(delta).coerceAtLeast(1),
                descricao = "Ajuste manual via app"
            )
        )
    }
}
