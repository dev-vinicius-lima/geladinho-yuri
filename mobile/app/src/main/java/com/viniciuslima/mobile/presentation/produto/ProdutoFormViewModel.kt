package com.viniciuslima.mobile.presentation.produto

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.categoria.CategoriaItemDto
import com.viniciuslima.mobile.data.remote.dto.produto.CreateProdutoRequestDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDetalheDto
import com.viniciuslima.mobile.data.remote.dto.produto.UpdateProdutoRequestDto
import com.viniciuslima.mobile.domain.usecase.categoria.GetCategoriasUseCase
import com.viniciuslima.mobile.domain.usecase.produto.CreateProdutoUseCase
import com.viniciuslima.mobile.domain.usecase.produto.GetProdutoByIdUseCase
import com.viniciuslima.mobile.domain.usecase.produto.MovimentarEstoqueUseCase
import com.viniciuslima.mobile.domain.usecase.produto.UpdateProdutoUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface ProdutoFormUiState {
    object Carregando : ProdutoFormUiState
    data class Pronto(
        val categorias: List<CategoriaItemDto>,
        val produtoEditando: ProdutoDetalheDto? = null,
        val salvando: Boolean = false
    ) : ProdutoFormUiState
    data class Erro(val mensagem: String) : ProdutoFormUiState
}

sealed interface ProdutoFormEvento {
    object Salvo : ProdutoFormEvento
    data class Falha(val mensagem: String) : ProdutoFormEvento
}

@HiltViewModel
class ProdutoFormViewModel @Inject constructor(
    private val getCategoriasUseCase: GetCategoriasUseCase,
    private val createProdutoUseCase: CreateProdutoUseCase,
    private val updateProdutoUseCase: UpdateProdutoUseCase,
    private val getProdutoByIdUseCase: GetProdutoByIdUseCase,
    private val movimentarEstoqueUseCase: MovimentarEstoqueUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProdutoFormUiState>(ProdutoFormUiState.Carregando)
    val uiState: StateFlow<ProdutoFormUiState> = _uiState

    private val _eventos = Channel<ProdutoFormEvento>(Channel.BUFFERED)
    val eventos = _eventos.receiveAsFlow()

    fun inicializar(context: Context, produtoId: String?) {
        viewModelScope.launch {
            _uiState.value = ProdutoFormUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""

            val categoriasResult = getCategoriasUseCase(token)
            if (categoriasResult is NetworkResult.Error) {
                _uiState.value = ProdutoFormUiState.Erro(categoriasResult.message)
                return@launch
            }
            val categorias = (categoriasResult as NetworkResult.Success).data.data

            if (produtoId != null) {
                val produtoResult = getProdutoByIdUseCase(token, produtoId)
                if (produtoResult is NetworkResult.Error) {
                    _uiState.value = ProdutoFormUiState.Erro(produtoResult.message)
                    return@launch
                }
                val produto = (produtoResult as NetworkResult.Success).data.data
                _uiState.value = ProdutoFormUiState.Pronto(categorias, produto)
            } else {
                _uiState.value = ProdutoFormUiState.Pronto(categorias)
            }
        }
    }

    fun salvar(
        context: Context,
        produtoId: String?,
        nome: String,
        preco: String,
        quantidade: String,
        categoriaId: String,
        descricao: String,
        precoComCusto: String,
        estoqueMinimo: String,
        unidade: String,
    ) {
        val precoDouble = preco.replace(",", ".").toDoubleOrNull()
        val qtdInt = quantidade.toIntOrNull()

        if (nome.isBlank() || precoDouble == null || qtdInt == null || categoriaId.isBlank()) {
            viewModelScope.launch {
                _eventos.send(ProdutoFormEvento.Falha("Preencha nome, preço, quantidade e categoria."))
            }
            return
        }

        val current = _uiState.value as? ProdutoFormUiState.Pronto ?: return
        _uiState.value = current.copy(salvando = true)

        viewModelScope.launch {
            val token = TokenStore.getAccessToken(context).first() ?: ""

            if (produtoId != null) {
                // 1. Atualiza os dados do produto
                val updateResult = updateProdutoUseCase(
                    token, produtoId,
                    UpdateProdutoRequestDto(
                        nome = nome,
                        preco = precoDouble,
                        categoria_id = categoriaId,
                        descricao = descricao.ifBlank { null },
                        preco_custo = precoComCusto.replace(",", ".").toDoubleOrNull(),
                        estoque_minimo = estoqueMinimo.toIntOrNull(),
                        unidade = unidade.ifBlank { null },
                    )
                )
                if (updateResult is NetworkResult.Error) {
                    _uiState.value = current.copy(salvando = false)
                    _eventos.send(ProdutoFormEvento.Falha(updateResult.message))
                    return@launch
                }

                // 2. Se a quantidade mudou, registra movimentação de ajuste
                val quantidadeAtual = current.produtoEditando?.quantidade ?: qtdInt
                if (qtdInt != quantidadeAtual) {
                    val movResult = movimentarEstoqueUseCase(token, produtoId, qtdInt, quantidadeAtual)
                    if (movResult is NetworkResult.Error) {
                        _uiState.value = current.copy(salvando = false)
                        _eventos.send(ProdutoFormEvento.Falha(movResult.message))
                        return@launch
                    }
                }

                _uiState.value = current.copy(salvando = false)
                _eventos.send(ProdutoFormEvento.Salvo)
            } else {
                // Novo produto
                val result = createProdutoUseCase(
                    token,
                    CreateProdutoRequestDto(
                        nome = nome,
                        preco = precoDouble,
                        quantidade = qtdInt,
                        categoria_id = categoriaId,
                        descricao = descricao.ifBlank { null },
                        preco_custo = precoComCusto.replace(",", ".").toDoubleOrNull(),
                        estoque_minimo = estoqueMinimo.toIntOrNull(),
                        unidade = unidade.ifBlank { null },
                    )
                )
                _uiState.value = current.copy(salvando = false)
                when (result) {
                    is NetworkResult.Success -> _eventos.send(ProdutoFormEvento.Salvo)
                    is NetworkResult.Error -> _eventos.send(ProdutoFormEvento.Falha(result.message))
                    else -> Unit
                }
            }
        }
    }
}
