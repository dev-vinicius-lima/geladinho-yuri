package com.viniciuslima.mobile.presentation.perfil

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.usuario.UsuarioDto
import com.viniciuslima.mobile.domain.usecase.usuario.ChangeSenhaUseCase
import com.viniciuslima.mobile.domain.usecase.usuario.GetMeuPerfilUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface PerfilUiState {
    object Carregando : PerfilUiState
    data class Pronto(
        val usuario: UsuarioDto,
        val salvandoSenha: Boolean = false
    ) : PerfilUiState
    data class Erro(val mensagem: String) : PerfilUiState
}

sealed interface PerfilEvento {
    data class Sucesso(val mensagem: String) : PerfilEvento
    data class Falha(val mensagem: String) : PerfilEvento
}

@HiltViewModel
class PerfilViewModel @Inject constructor(
    private val getMeuPerfilUseCase: GetMeuPerfilUseCase,
    private val changeSenhaUseCase: ChangeSenhaUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<PerfilUiState>(PerfilUiState.Carregando)
    val uiState: StateFlow<PerfilUiState> = _uiState

    private val _eventos = Channel<PerfilEvento>(Channel.BUFFERED)
    val eventos = _eventos.receiveAsFlow()

    fun carregarPerfil(context: Context) {
        viewModelScope.launch {
            _uiState.value = PerfilUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = getMeuPerfilUseCase(token)) {
                is NetworkResult.Success -> _uiState.value = PerfilUiState.Pronto(result.data.data)
                is NetworkResult.Error -> _uiState.value = PerfilUiState.Erro(result.message)
                else -> Unit
            }
        }
    }

    fun trocarSenha(context: Context, senhaAtual: String, novaSenha: String, confirmarSenha: String) {
        if (senhaAtual.isBlank() || novaSenha.isBlank()) {
            viewModelScope.launch {
                _eventos.send(PerfilEvento.Falha("Preencha todos os campos de senha."))
            }
            return
        }
        if (novaSenha != confirmarSenha) {
            viewModelScope.launch {
                _eventos.send(PerfilEvento.Falha("A nova senha e a confirmação não coincidem."))
            }
            return
        }

        val current = _uiState.value as? PerfilUiState.Pronto ?: return
        _uiState.value = current.copy(salvandoSenha = true)

        viewModelScope.launch {
            val token = TokenStore.getAccessToken(context).first() ?: ""
            when (val result = changeSenhaUseCase(token, senhaAtual, novaSenha)) {
                is NetworkResult.Success -> {
                    _uiState.value = current.copy(salvandoSenha = false)
                    _eventos.send(PerfilEvento.Sucesso("Senha alterada com sucesso!"))
                }
                is NetworkResult.Error -> {
                    _uiState.value = current.copy(salvandoSenha = false)
                    _eventos.send(PerfilEvento.Falha(result.message))
                }
                else -> _uiState.value = current.copy(salvandoSenha = false)
            }
        }
    }
}
