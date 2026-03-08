package com.viniciuslima.mobile.presentation.auth.login

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.auth.LoginRequestDto
import com.viniciuslima.mobile.data.remote.dto.auth.LoginResponseDto
import com.viniciuslima.mobile.domain.usecase.auth.LoginUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

sealed interface LoginUiState {
    object Idle : LoginUiState
    object Loading : LoginUiState
    data class Success(val data: LoginResponseDto) : LoginUiState
    data class Error(val message: String) : LoginUiState
}

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase
) : ViewModel() {
    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState

    fun login(cpf: String, senha: String, context: Context? = null) {
            Log.d("LoginViewModel", "Iniciando login para cpf=$cpf")
            _uiState.value = LoginUiState.Loading
            viewModelScope.launch {
                val result = loginUseCase(LoginRequestDto(cpf, senha))
                Log.d("LoginViewModel", "Resultado da requisição: $result")
                if (result is NetworkResult.Success && context != null) {
                    val tokens = result.data
                    TokenStore.saveTokens(
                        context,
                        tokens.access_token,
                        tokens.refresh_token
                    )
                    Log.d("LoginViewModel", "Tokens salvos: ${tokens.access_token}, ${tokens.refresh_token}")
                }
                _uiState.value = when (result) {
                    is NetworkResult.Success -> LoginUiState.Success(result.data)
                    is NetworkResult.Error -> {
                        Log.e("LoginViewModel", "Erro ao fazer login: ${result.message}")
                        LoginUiState.Error(result.message ?: "Unknown error")
                    }
                    else -> LoginUiState.Idle
                }
            }
    }
}
