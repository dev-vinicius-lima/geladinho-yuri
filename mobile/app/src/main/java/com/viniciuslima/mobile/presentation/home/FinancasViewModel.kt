package com.viniciuslima.mobile.presentation.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.financeiro.ContaFinanceiraDto
import com.viniciuslima.mobile.data.remote.dto.financeiro.ResumoFinanceiroDto
import com.viniciuslima.mobile.domain.usecase.financeiro.GetContasUseCase
import com.viniciuslima.mobile.domain.usecase.financeiro.GetResumoFinanceiroUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface FinancasUiState {
    object Carregando : FinancasUiState
    data class Pronto(
        val resumo: ResumoFinanceiroDto,
        val contas: List<ContaFinanceiraDto>
    ) : FinancasUiState
    data class Erro(val mensagem: String) : FinancasUiState
}

@HiltViewModel
class FinancasViewModel @Inject constructor(
    private val getResumoUseCase: GetResumoFinanceiroUseCase,
    private val getContasUseCase: GetContasUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<FinancasUiState>(FinancasUiState.Carregando)
    val uiState: StateFlow<FinancasUiState> = _uiState

    fun carregarDados(context: Context) {
        viewModelScope.launch {
            _uiState.value = FinancasUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""

            val resumoResult = getResumoUseCase(token)
            val contasResult = getContasUseCase(token)

            if (resumoResult is NetworkResult.Success && contasResult is NetworkResult.Success) {
                _uiState.value = FinancasUiState.Pronto(
                    resumo = resumoResult.data.data,
                    contas = contasResult.data.data
                )
            } else {
                val erro = (resumoResult as? NetworkResult.Error)?.message
                    ?: (contasResult as? NetworkResult.Error)?.message
                    ?: "Erro ao carregar dados"
                _uiState.value = FinancasUiState.Erro(erro)
            }
        }
    }
}
