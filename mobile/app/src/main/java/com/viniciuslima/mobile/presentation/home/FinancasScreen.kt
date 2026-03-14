package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.viniciuslima.mobile.ui.theme.ErrorRed
import com.viniciuslima.mobile.ui.theme.SuccessGreen

@Composable
fun FinancasScreen() {
    val receitas = 2450.00
    val despesas = 1230.00
    val saldo = receitas - despesas

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
        // Resumo financeiro
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.Start
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.ArrowUpward, contentDescription = null, tint = SuccessGreen)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Receitas", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("R$ ${"%.2f".format(receitas)}", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = SuccessGreen)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.weight(1f)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.Start
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.ArrowDownward, contentDescription = null, tint = ErrorRed)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Despesas", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("R$ ${"%.2f".format(despesas)}", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = ErrorRed)
                }
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        // Saldo
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Saldo do Período:", fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    "R$ ${"%.2f".format(saldo)}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    color = if (saldo >= 0) SuccessGreen else ErrorRed
                )
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        // Histórico (mock)
        Text(
            text = "Histórico de Movimentações",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        Column(
            modifier = Modifier.weight(1f, fill = false)
        ) {
            FinancaMovimentacao("Venda #1234", 120.00, true, "13:45")
            FinancaMovimentacao("Compra insumos", 80.00, false, "12:10")
            FinancaMovimentacao("Venda #1233", 90.00, true, "11:30")
        }
    }
}

@Composable
fun FinancaMovimentacao(descricao: String, valor: Double, receita: Boolean, hora: String) {
    Card(
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                if (receita) Icons.Filled.ArrowUpward else Icons.Filled.ArrowDownward,
                contentDescription = null,
                tint = if (receita) SuccessGreen else ErrorRed
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(descricao, fontWeight = FontWeight.Bold)
                Text(hora, color = Color(0xFF7B7B7B), fontSize = 14.sp)
            }
            Text(
                (if (receita) "+" else "-") + "R$ ${"%.2f".format(valor)}",
                fontWeight = FontWeight.Bold,
                color = if (receita) SuccessGreen else ErrorRed
            )
        }
    }
}

