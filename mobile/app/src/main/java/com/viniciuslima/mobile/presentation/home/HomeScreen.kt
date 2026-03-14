package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HomeScreen() {
    Surface(
        color = MaterialTheme.colorScheme.background,
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
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
                    Text("Mercadinho Silva", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                }
                Surface(
                    shape = CircleShape,
                    color = Color(0xFFF5F5F5),
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(Icons.Filled.Notifications, contentDescription = "Notificações", tint = Color(0xFF7B7B7B))
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
            // Resumo do Dia
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Card(
                    modifier = Modifier.weight(1f).height(100.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Filled.AttachMoney, contentDescription = null, tint = Color(0xFF3B82F6))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("+12%", color = Color(0xFF22C55E), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Vendas Hoje", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                        Text("R$ 1.450,00", fontWeight = FontWeight.Bold, fontSize = 22.sp)
                    }
                }
                Spacer(modifier = Modifier.width(16.dp))
                Card(
                    modifier = Modifier.weight(1f).height(100.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Icon(Icons.Filled.Event, contentDescription = null, tint = Color(0xFFF59E42))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Pedidos", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                        Text("42", fontWeight = FontWeight.Bold, fontSize = 22.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
            // Ações Rápidas
            Column(modifier = Modifier.fillMaxWidth()) {
                Text("Ações Rápidas", fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF7B7B7B))
                Spacer(modifier = Modifier.height(12.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    QuickActionButton("Abrir PDV", Icons.Filled.Store, Color(0xFF2563EB), true)
                    QuickActionButton("Novo Produto", Icons.Filled.Add, Color(0xFFF1F5F9))
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    QuickActionButton("Sangria", Icons.Filled.RemoveCircle, Color(0xFFF1F5F9))
                    QuickActionButton("Fechar Caixa", Icons.Filled.Lock, Color(0xFFF1F5F9), locked = true)
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
            // Atenção Necessária
            Column(modifier = Modifier.fillMaxWidth()) {
                Text("Atenção Necessária", fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF7B7B7B))
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F1)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Filled.Warning, contentDescription = null, tint = Color(0xFFFF3B30))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Estoque Crítico", fontWeight = FontWeight.Bold, color = Color(0xFF1C1B1F))
                            Text("5 produtos acabando", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                        }
                        Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Color(0xFF7B7B7B))
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
            // Últimos Pedidos
            Column(modifier = Modifier.fillMaxWidth()) {
                Text("Últimos Pedidos", fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color(0xFF7B7B7B))
                Spacer(modifier = Modifier.height(8.dp))
                // Exemplo de lista estática
                repeat(3) {
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
                                Text("Pedido #1234", fontWeight = FontWeight.Bold)
                                Text("R$ 120,00 - 13:45", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                            }
                            Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Color(0xFF7B7B7B))
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun QuickActionButton(
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    background: Color,
    highlight: Boolean = false,
    locked: Boolean = false
) {
    val contentColor = if (highlight) Color.White else Color(0xFF1C1B1F)
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = background,
        modifier = Modifier
            .height(64.dp)
            .padding(horizontal = 4.dp),
        tonalElevation = if (highlight) 4.dp else 0.dp
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
