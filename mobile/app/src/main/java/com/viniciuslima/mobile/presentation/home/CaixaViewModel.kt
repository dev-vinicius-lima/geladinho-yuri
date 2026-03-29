package com.viniciuslima.mobile.presentation.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaAbertoDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaDataDto
import com.viniciuslima.mobile.domain.usecase.caixa.AbrirCaixaUseCase
import com.viniciuslima.mobile.domain.usecase.caixa.FecharCaixaUseCase
import com.viniciuslima.mobile.domain.usecase.caixa.GetCaixaAbertoUseCase
import com.viniciuslima.mobile.domain.usecase.caixa.SangriaUseCase
import com.viniciuslima.mobile.domain.usecase.caixa.SuprimentoUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// =============================================================================
// Estado do Caixa
// =============================================================================

sealed interface CaixaUiState {
    object Carregando : CaixaUiState
    object SemCaixa : CaixaUiState
    data class CaixaAberto(val caixa: CaixaAbertoDto) : CaixaUiState
    data class Erro(val mensagem: String) : CaixaUiState
}

// Eventos one-shot que a UI consome uma vez (Snackbar, dialog de resultado)
sealed interface CaixaEvento {
    data class Sucesso(val mensagem: String) : CaixaEvento
    data class Falha(val mensagem: String) : CaixaEvento
    data class CaixaFechado(val resultado: FecharCaixaDataDto) : CaixaEvento
}

// =============================================================================
// ViewModel
// =============================================================================

@HiltViewModel
class CaixaViewModel @Inject constructor(
    private val getCaixaAbertoUseCase: GetCaixaAbertoUseCase,
    private val abrirCaixaUseCase: AbrirCaixaUseCase,
    private val fecharCaixaUseCase: FecharCaixaUseCase,
    private val sangriaUseCase: SangriaUseCase,
    private val suprimentoUseCase: SuprimentoUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<CaixaUiState>(CaixaUiState.Carregando)
    val uiState: StateFlow<CaixaUiState> = _uiState

    // Canal de eventos one-shot para a UI
    private val _eventos = Channel<CaixaEvento>(Channel.BUFFERED)
    val eventos = _eventos.receiveAsFlow()

    // Verifica se há caixa aberto — chamar ao abrir a tela PDV
    fun verificarCaixa(context: Context) {
        viewModelScope.launch {
            _uiState.value = CaixaUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = getCaixaAbertoUseCase(token)) {
                is NetworkResult.Success -> {
                    val caixa = result.data.data
                    _uiState.value = if (caixa != null) {
                        CaixaUiState.CaixaAberto(caixa)
                    } else {
                        CaixaUiState.SemCaixa
                    }
                }
                is NetworkResult.Error -> {
                    _uiState.value = CaixaUiState.Erro(result.message)
                }
                else -> Unit
            }
        }
    }

    // Abre um novo caixa com o valor informado
    fun abrirCaixa(context: Context, valorAbertura: Double) {
        viewModelScope.launch {
            _uiState.value = CaixaUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = abrirCaixaUseCase(token, valorAbertura)) {
                is NetworkResult.Success -> {
                    _uiState.value = CaixaUiState.CaixaAberto(result.data.data)
                    _eventos.send(CaixaEvento.Sucesso("Caixa aberto com sucesso!"))
                }
                is NetworkResult.Error -> {
                    _uiState.value = CaixaUiState.SemCaixa
                    _eventos.send(CaixaEvento.Falha(result.message))
                }
                else -> Unit
            }
        }
    }

    // Fecha o caixa com o valor contado fisicamente
    fun fecharCaixa(context: Context, valorFechamento: Double) {
        val caixaAtual = (_uiState.value as? CaixaUiState.CaixaAberto)?.caixa ?: return
        viewModelScope.launch {
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = fecharCaixaUseCase(token, caixaAtual.id, valorFechamento)) {
                is NetworkResult.Success -> {
                    _uiState.value = CaixaUiState.SemCaixa
                    _eventos.send(CaixaEvento.CaixaFechado(result.data.data))
                }
                is NetworkResult.Error -> {
                    _eventos.send(CaixaEvento.Falha(result.message))
                }
                else -> Unit
            }
        }
    }

    // Registra uma sangria
    fun registrarSangria(context: Context, valor: Double, descricao: String?) {
        val caixaAtual = (_uiState.value as? CaixaUiState.CaixaAberto)?.caixa ?: return
        viewModelScope.launch {
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = sangriaUseCase(token, caixaAtual.id, valor, descricao)) {
                is NetworkResult.Success -> {
                    _uiState.value = CaixaUiState.CaixaAberto(result.data.data)
                    _eventos.send(CaixaEvento.Sucesso("Sangria registrada: R$ ${"%.2f".format(valor)}"))
                }
                is NetworkResult.Error -> {
                    _eventos.send(CaixaEvento.Falha(result.message))
                }
                else -> Unit
            }
        }
    }

    // Registra um suprimento
    fun registrarSuprimento(context: Context, valor: Double, descricao: String?) {
        val caixaAtual = (_uiState.value as? CaixaUiState.CaixaAberto)?.caixa ?: return
        viewModelScope.launch {
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = suprimentoUseCase(token, caixaAtual.id, valor, descricao)) {
                is NetworkResult.Success -> {
                    _uiState.value = CaixaUiState.CaixaAberto(result.data.data)
                    _eventos.send(CaixaEvento.Sucesso("Suprimento registrado: R$ ${"%.2f".format(valor)}"))
                }
                is NetworkResult.Error -> {
                    _eventos.send(CaixaEvento.Falha(result.message))
                }
                else -> Unit
            }
        }
    }
}
