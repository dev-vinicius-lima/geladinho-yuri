package com.viniciuslima.mobile.presentation.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDto
import com.viniciuslima.mobile.data.remote.dto.venda.CreateItemVendaDto
import com.viniciuslima.mobile.data.remote.dto.venda.CreateVendaDto
import com.viniciuslima.mobile.domain.usecase.produto.GetProdutosUseCase
import com.viniciuslima.mobile.domain.usecase.venda.CreateVendaUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

// =============================================================================
// Estado do PDV
// =============================================================================
// Guarda tudo que a tela precisa saber:
//   - Lista de produtos disponíveis para adicionar
//   - Carrinho (mapa de produto → quantidade)
//   - Se está carregando / se finalizou / se deu erro
// =============================================================================

data class CarrinhoItem(
    val produto: ProdutoDto,
    val quantidade: Int
)

sealed interface PdvUiState {
    object Carregando : PdvUiState
    data class Pronto(val produtos: List<ProdutoDto>) : PdvUiState
    data class Erro(val mensagem: String) : PdvUiState
    object VendaFinalizada : PdvUiState
}

@HiltViewModel
class PDVViewModel @Inject constructor(
    private val getProdutosUseCase: GetProdutosUseCase,
    private val createVendaUseCase: CreateVendaUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<PdvUiState>(PdvUiState.Carregando)
    val uiState: StateFlow<PdvUiState> = _uiState

    // Carrinho: produto_id → CarrinhoItem
    private val _carrinho = MutableStateFlow<Map<String, CarrinhoItem>>(emptyMap())
    val carrinho: StateFlow<Map<String, CarrinhoItem>> = _carrinho

    val total: Double
        get() = _carrinho.value.values.sumOf { it.produto.preco * it.quantidade }

    // Formas de pagamento disponíveis
    val formasPagamento = listOf("dinheiro", "pix", "cartao_credito", "cartao_debito")

    // null = nenhuma forma selecionada ainda
    private val _formaPagamento = MutableStateFlow<String?>(null)
    val formaPagamento: StateFlow<String?> = _formaPagamento

    fun selecionarFormaPagamento(forma: String) {
        _formaPagamento.value = forma
    }

    fun carregarProdutos(context: Context) {
        viewModelScope.launch {
            _uiState.value = PdvUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = getProdutosUseCase(token)) {
                is NetworkResult.Success -> {
                    _uiState.value = PdvUiState.Pronto(result.data.data)
                }
                is NetworkResult.Error -> {
                    _uiState.value = PdvUiState.Erro(result.message)
                }
                else -> Unit
            }
        }
    }

    fun adicionarProduto(produto: ProdutoDto) {
        val atual = _carrinho.value.toMutableMap()
        val existente = atual[produto.id]
        atual[produto.id] = if (existente == null) {
            CarrinhoItem(produto, 1)
        } else {
            existente.copy(quantidade = existente.quantidade + 1)
        }
        _carrinho.value = atual
    }

    fun removerProduto(produtoId: String) {
        val atual = _carrinho.value.toMutableMap()
        val existente = atual[produtoId] ?: return
        if (existente.quantidade <= 1) {
            atual.remove(produtoId)
        } else {
            atual[produtoId] = existente.copy(quantidade = existente.quantidade - 1)
        }
        _carrinho.value = atual
    }

    fun finalizarVenda(context: Context) {
        val itensCarrinho = _carrinho.value.values.toList()
        if (itensCarrinho.isEmpty()) return

        viewModelScope.launch {
            _uiState.value = PdvUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""
            val dto = CreateVendaDto(
                itens = itensCarrinho.map {
                    CreateItemVendaDto(
                        produto_id = it.produto.id,
                        quantidade = it.quantidade,
                        preco_unitario = it.produto.preco
                    )
                },
                forma_pagamento = _formaPagamento.value ?: return@launch
            )
            when (val result = createVendaUseCase(token, dto)) {
                is NetworkResult.Success -> {
                    _carrinho.value = emptyMap()
                    _formaPagamento.value = null
                    _uiState.value = PdvUiState.VendaFinalizada
                }
                is NetworkResult.Error -> {
                    _uiState.value = PdvUiState.Erro(result.message)
                }
                else -> Unit
            }
        }
    }
}
