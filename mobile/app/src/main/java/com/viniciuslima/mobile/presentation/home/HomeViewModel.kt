package com.viniciuslima.mobile.presentation.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viniciuslima.mobile.core.datastore.TokenStore
import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.venda.DashboardDataDto
import com.viniciuslima.mobile.data.remote.dto.venda.VendaRecenteDto
import com.viniciuslima.mobile.domain.usecase.venda.GetDashboardUseCase
import com.viniciuslima.mobile.domain.usecase.venda.GetVendasRecentesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

// =============================================================================
// Estado da Home
// =============================================================================

sealed interface HomeUiState {
    object Carregando : HomeUiState
    data class Pronto(
        val dashboard: DashboardDataDto,
        val pedidosRecentes: List<VendaRecenteDto>,
        val estoqueCritico: Int = 0
    ) : HomeUiState
    data class Erro(val mensagem: String) : HomeUiState
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getDashboardUseCase: GetDashboardUseCase,
    private val getVendasRecentesUseCase: GetVendasRecentesUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Carregando)
    val uiState: StateFlow<HomeUiState> = _uiState

    fun carregarDados(context: Context) {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Carregando
            val token = TokenStore.getAccessToken(context).first() ?: ""

            val dashboardResult = getDashboardUseCase(token)
            val recentesResult = getVendasRecentesUseCase(token)

            if (dashboardResult is NetworkResult.Success && recentesResult is NetworkResult.Success) {
                _uiState.value = HomeUiState.Pronto(
                    dashboard = dashboardResult.data.data,
                    pedidosRecentes = recentesResult.data.data,
                    estoqueCritico = dashboardResult.data.data.estoque_critico_count
                )
            } else {
                val mensagem = (dashboardResult as? NetworkResult.Error)?.message
                    ?: (recentesResult as? NetworkResult.Error)?.message
                    ?: "Erro ao carregar dados"
                _uiState.value = HomeUiState.Erro(mensagem)
            }
        }
    }
}
