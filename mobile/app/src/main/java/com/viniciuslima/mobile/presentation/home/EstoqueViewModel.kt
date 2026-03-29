package com.viniciuslima.mobile.presentation.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDto
import com.viniciuslima.mobile.domain.usecase.produto.GetProdutosUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface EstoqueUiState {
    object Carregando : EstoqueUiState
    data class Pronto(val produtos: List<ProdutoDto>) : EstoqueUiState
    data class Erro(val mensagem: String) : EstoqueUiState
}

@HiltViewModel
class EstoqueViewModel @Inject constructor(
    private val getProdutosUseCase: GetProdutosUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<EstoqueUiState>(EstoqueUiState.Carregando)
    val uiState: StateFlow<EstoqueUiState> = _uiState

    fun carregarProdutos(context: Context) {
        viewModelScope.launch {
            _uiState.value = EstoqueUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = getProdutosUseCase(token)) {
                is NetworkResult.Success -> _uiState.value = EstoqueUiState.Pronto(result.data.data)
                is NetworkResult.Error -> _uiState.value = EstoqueUiState.Erro(result.message)
                else -> Unit
            }
        }
    }
}
