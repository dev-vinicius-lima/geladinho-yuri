package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.viniciuslima.mobile.data.remote.dto.financeiro.ContaFinanceiraDto
import com.viniciuslima.mobile.ui.theme.ErrorRed
import com.viniciuslima.mobile.ui.theme.SuccessGreen

@Composable
fun FinancasScreen(
    viewModel: FinancasViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.carregarDados(context)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Finanças",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))

        when (val state = uiState) {
            is FinancasUiState.Carregando -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }

            is FinancasUiState.Erro -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.mensagem, color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { viewModel.carregarDados(context) }) {
                            Text("Tentar novamente")
                        }
                    }
                }
            }

            is FinancasUiState.Pronto -> {
                val resumo = state.resumo

                // Cards de resumo: a receber e a pagar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.ArrowUpward, contentDescription = null, tint = SuccessGreen)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("A receber", color = Color(0xFF7B7B7B), fontSize = 13.sp)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "R$ ${"%.2f".format(resumo.total_a_receber)}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = SuccessGreen
                            )
                        }
                    }
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.ArrowDownward, contentDescription = null, tint = ErrorRed)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("A pagar", color = Color(0xFF7B7B7B), fontSize = 13.sp)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "R$ ${"%.2f".format(resumo.total_a_pagar)}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = ErrorRed
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Saldo projetado
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Saldo projetado (30 dias):", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                        Spacer(modifier = Modifier.weight(1f))
                        Text(
                            "R$ ${"%.2f".format(resumo.saldo_projetado)}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = if (resumo.saldo_projetado >= 0) SuccessGreen else ErrorRed
                        )
                    }
                }

                // Alerta de contas vencidas
                if (resumo.contas_vencidas_count > 0) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F1)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Filled.Warning, contentDescription = null, tint = ErrorRed)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                "${resumo.contas_vencidas_count} conta(s) vencida(s)",
                                color = ErrorRed,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    "Contas (${state.contas.size})",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))

                if (state.contas.isEmpty()) {
                    Text("Nenhuma conta encontrada.", color = Color.Gray, fontSize = 14.sp)
                } else {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(state.contas) { conta ->
                            ContaCard(conta)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ContaCard(conta: ContaFinanceiraDto) {
    val receber = conta.tipo == "receber"
    val vencida = conta.status == "vencida"
    val cor = when {
        vencida -> ErrorRed
        receber -> SuccessGreen
        else -> ErrorRed
    }
    val vencimento = conta.vencimento.take(10)

    Card(
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                if (receber) Icons.Filled.ArrowUpward else Icons.Filled.ArrowDownward,
                contentDescription = null,
                tint = cor
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(conta.descricao, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("Vence: $vencimento", color = Color(0xFF7B7B7B), fontSize = 12.sp)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    (if (receber) "+" else "-") + "R$ ${"%.2f".format(conta.valor)}",
                    fontWeight = FontWeight.Bold,
                    color = cor,
                    fontSize = 14.sp
                )
                if (vencida) {
                    Text("Vencida", color = ErrorRed, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
