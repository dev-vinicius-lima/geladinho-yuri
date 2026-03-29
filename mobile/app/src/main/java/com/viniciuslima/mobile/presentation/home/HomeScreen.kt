package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.viniciuslima.mobile.data.remote.dto.venda.VendaRecenteDto

// =============================================================================
// Tela Home — dashboard com dados reais da API
// =============================================================================
// Fluxo:
//   1. Ao abrir, carrega dashboard (vendas hoje + pedidos) e pedidos recentes
//   2. Exibe os dados em cards
//   3. Botão "Abrir PDV" navega para a tela de PDV
// =============================================================================

@Composable
fun HomeScreen(
    onAbrirPdv: () -> Unit = {},
    onNovoProduto: () -> Unit = {},
    onAbrirPerfil: () -> Unit = {},
    onAbrirEstoque: () -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // Carrega na primeira vez que a tela aparece
    LaunchedEffect(Unit) {
        viewModel.carregarDados(context)
    }

    Surface(
        color = MaterialTheme.colorScheme.background,
        modifier = Modifier.fillMaxSize()
    ) {
        when (val state = uiState) {
            is HomeUiState.Carregando -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }

            is HomeUiState.Erro -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.mensagem, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { viewModel.carregarDados(context) }) {
                            Text("Tentar novamente")
                        }
                    }
                }
            }

            is HomeUiState.Pronto -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(modifier = Modifier.height(24.dp))

                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = Color(0xFFEFF4FF),
                            modifier = Modifier.size(56.dp)
                        ) {
                            Icon(
                                Icons.Filled.Person,
                                contentDescription = "User",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("LOJA ABERTA", fontSize = 12.sp, color = Color(0xFF7B7B7B))
                            Text("Geladinho do Yuri", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        }
                        Surface(
                            shape = CircleShape,
                            color = Color(0xFFF5F5F5),
                            modifier = Modifier.size(36.dp),
                            onClick = onAbrirPerfil
                        ) {
                            Icon(Icons.Filled.Person, contentDescription = "Perfil", tint = Color(0xFF7B7B7B))
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Dashboard: Vendas Hoje e Pedidos
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Card Vendas Hoje
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.Start
                            ) {
                                Icon(Icons.Filled.AttachMoney, contentDescription = null, tint = Color(0xFF3B82F6))
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Vendas Hoje", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                                Text(
                                    "R$ ${"%.2f".format(state.dashboard.vendas_hoje.total)}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 20.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        // Card Pedidos
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.Start
                            ) {
                                Icon(Icons.Filled.Event, contentDescription = null, tint = Color(0xFFF59E42))
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Pedidos", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                                Text(
                                    "${state.dashboard.vendas_hoje.quantidade}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 22.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Ações Rápidas
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text("Ações Rápidas", fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF7B7B7B))
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            QuickActionButton("Abrir PDV", Icons.Filled.Store, Color(0xFF2563EB), highlight = true, onClick = onAbrirPdv)
                            QuickActionButton("Novo Produto", Icons.Filled.Add, Color(0xFFF1F5F9), onClick = onNovoProduto)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            QuickActionButton("Sangria", Icons.Filled.RemoveCircle, Color(0xFFF1F5F9))
                            QuickActionButton("Fechar Caixa", Icons.Filled.Lock, Color(0xFFF1F5F9), locked = true)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Estoque crítico (dados reais)
                    if (state.estoqueCritico > 0) {
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text("Atenção Necessária", fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF7B7B7B))
                            Spacer(modifier = Modifier.height(8.dp))
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F1)),
                                modifier = Modifier.fillMaxWidth(),
                                onClick = onAbrirEstoque
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Filled.Warning, contentDescription = null, tint = Color(0xFFFF3B30))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Estoque Crítico", fontWeight = FontWeight.Bold, color = Color(0xFF1C1B1F))
                                        Text(
                                            "${state.estoqueCritico} produto(s) com baixo estoque",
                                            color = Color(0xFF7B7B7B),
                                            fontSize = 14.sp
                                        )
                                    }
                                    Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Color(0xFF7B7B7B))
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(24.dp))
                    }

                    // Últimos Pedidos (dados reais)
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text("Últimos Pedidos", fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF7B7B7B))
                        Spacer(modifier = Modifier.height(8.dp))

                        if (state.pedidosRecentes.isEmpty()) {
                            Text("Nenhum pedido ainda.", color = Color.Gray, fontSize = 14.sp)
                        } else {
                            state.pedidosRecentes.forEach { venda ->
                                PedidoCard(venda = venda)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

// =============================================================================
// Card de pedido recente
// =============================================================================
@Composable
private fun PedidoCard(venda: VendaRecenteDto) {
    val horario = venda.criado_em.take(16).replace("T", " ").takeLast(5) // HH:mm

    Card(
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Filled.Receipt, contentDescription = null, tint = Color(0xFF3B82F6))
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    "Pedido #${venda.id.takeLast(4).uppercase()}",
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "R$ ${"%.2f".format(venda.total)} - $horario",
                    color = Color(0xFF7B7B7B),
                    fontSize = 14.sp
                )
            }
            Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Color(0xFF7B7B7B))
        }
    }
}

// =============================================================================
// Botão de ação rápida
// =============================================================================
@Composable
fun QuickActionButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    background: Color,
    highlight: Boolean = false,
    locked: Boolean = false,
    onClick: () -> Unit = {}
) {
    val contentColor = if (highlight) Color.White else Color(0xFF1C1B1F)
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = background,
        modifier = Modifier
            .height(64.dp)
            .padding(horizontal = 4.dp),
        tonalElevation = if (highlight) 4.dp else 0.dp,
        onClick = onClick
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.fillMaxSize()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = if (locked) Color(0xFFBDBDBD) else contentColor)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text, color = if (locked) Color(0xFFBDBDBD) else contentColor, fontWeight = FontWeight.Bold)
            }
        }
    }
}
