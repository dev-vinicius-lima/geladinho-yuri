package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.RemoveCircle
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaDataDto

// =============================================================================
// Dialog — Abrir Caixa
// =============================================================================
// Aparece quando o operador tenta usar o PDV sem caixa aberto.
// Solicita o valor em caixa no momento da abertura.
// =============================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AbrirCaixaDialog(
    onConfirmar: (Double) -> Unit,
    onDismiss: () -> Unit
) {
    var valorTexto by remember { mutableStateOf("") }
    val valorDouble = valorTexto.replace(",", ".").toDoubleOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.AttachMoney,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                "Abrir Caixa",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Informe o valor em dinheiro disponível no caixa agora.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(20.dp))

            OutlinedTextField(
                value = valorTexto,
                onValueChange = { valorTexto = it },
                label = { Text("Valor de abertura (R$)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = { Icon(Icons.Filled.AttachMoney, contentDescription = null) }
            )

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancelar")
                }
                Button(
                    onClick = { valorDouble?.let { onConfirmar(it) } },
                    enabled = valorDouble != null && valorDouble >= 0,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Abrir Caixa")
                }
            }
        }
    }
}

// =============================================================================
// Dialog — Fechar Caixa
// =============================================================================
// Exibe o saldo esperado calculado pelo backend e pede a contagem física.
// Mostra a diferença (sobra/falta) após confirmar.
// =============================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FecharCaixaDialog(
    saldoEsperado: Double,
    onConfirmar: (Double) -> Unit,
    onDismiss: () -> Unit
) {
    var valorTexto by remember { mutableStateOf("") }
    val valorDouble = valorTexto.replace(",", ".").toDoubleOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.Lock,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                "Fechar Caixa",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Saldo esperado
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Saldo esperado:", color = Color.Gray)
                    Text(
                        "R$ ${"%.2f".format(saldoEsperado)}",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = valorTexto,
                onValueChange = { valorTexto = it },
                label = { Text("Valor contado (R$)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = { Icon(Icons.Filled.AttachMoney, contentDescription = null) }
            )

            // Diferença em tempo real
            valorDouble?.let { contado ->
                val diferenca = contado - saldoEsperado
                Spacer(modifier = Modifier.height(8.dp))
                val cor = when {
                    diferenca > 0 -> Color(0xFF16A34A)
                    diferenca < 0 -> MaterialTheme.colorScheme.error
                    else -> Color.Gray
                }
                val texto = when {
                    diferenca > 0 -> "Sobra: R$ ${"%.2f".format(diferenca)}"
                    diferenca < 0 -> "Falta: R$ ${"%.2f".format(-diferenca)}"
                    else -> "Sem diferença"
                }
                Text(texto, color = cor, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancelar")
                }
                Button(
                    onClick = { valorDouble?.let { onConfirmar(it) } },
                    enabled = valorDouble != null,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Fechar Caixa")
                }
            }
        }
    }
}

// =============================================================================
// Dialog — Resultado do Fechamento
// =============================================================================
// Exibido após o fechamento bem-sucedido com o resumo final.
// =============================================================================

@Composable
fun ResultadoFechamentoDialog(
    resultado: FecharCaixaDataDto,
    onDismiss: () -> Unit
) {
    val diferenca = resultado.diferenca
    val corDiferenca = when {
        diferenca > 0 -> Color(0xFF16A34A)
        diferenca < 0 -> MaterialTheme.colorScheme.error
        else -> Color.Gray
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Caixa Fechado", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ResultadoLinha("Valor de abertura", resultado.valor_abertura)
                ResultadoLinha("Valor contado", resultado.valor_fechamento)
                ResultadoLinha("Saldo esperado", resultado.saldo_esperado)
                Divider()
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        if (diferenca >= 0) "Sobra" else "Falta",
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "R$ ${"%.2f".format(kotlin.math.abs(diferenca))}",
                        fontWeight = FontWeight.Bold,
                        color = corDiferenca
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("OK")
            }
        }
    )
}

@Composable
private fun ResultadoLinha(label: String, valor: Double) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color.Gray, fontSize = 14.sp)
        Text("R$ ${"%.2f".format(valor)}", fontSize = 14.sp)
    }
}

// =============================================================================
// Dialog — Sangria
// =============================================================================
// Registra uma retirada de dinheiro do caixa.
// =============================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SangriaDialog(
    onConfirmar: (valor: Double, descricao: String?) -> Unit,
    onDismiss: () -> Unit
) {
    var valorTexto by remember { mutableStateOf("") }
    var descricao by remember { mutableStateOf("") }
    val valorDouble = valorTexto.replace(",", ".").toDoubleOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.RemoveCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text("Sangria", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
            Text("Retirada de dinheiro do caixa", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            Spacer(modifier = Modifier.height(20.dp))

            OutlinedTextField(
                value = valorTexto,
                onValueChange = { valorTexto = it },
                label = { Text("Valor (R$)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = descricao,
                onValueChange = { descricao = it },
                label = { Text("Descrição (opcional)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(24.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                    Text("Cancelar")
                }
                Button(
                    onClick = {
                        valorDouble?.let {
                            onConfirmar(it, descricao.ifBlank { null })
                        }
                    },
                    enabled = valorDouble != null && valorDouble > 0,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Confirmar")
                }
            }
        }
    }
}

// =============================================================================
// Dialog — Suprimento
// =============================================================================
// Registra uma entrada extra de dinheiro no caixa.
// =============================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SuprimentoDialog(
    onConfirmar: (valor: Double, descricao: String?) -> Unit,
    onDismiss: () -> Unit
) {
    var valorTexto by remember { mutableStateOf("") }
    var descricao by remember { mutableStateOf("") }
    val valorDouble = valorTexto.replace(",", ".").toDoubleOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.AddCircle,
                contentDescription = null,
                tint = Color(0xFF16A34A),
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text("Suprimento", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
            Text("Entrada de dinheiro no caixa", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            Spacer(modifier = Modifier.height(20.dp))

            OutlinedTextField(
                value = valorTexto,
                onValueChange = { valorTexto = it },
                label = { Text("Valor (R$)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = descricao,
                onValueChange = { descricao = it },
                label = { Text("Descrição (opcional)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(24.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                    Text("Cancelar")
                }
                Button(
                    onClick = {
                        valorDouble?.let {
                            onConfirmar(it, descricao.ifBlank { null })
                        }
                    },
                    enabled = valorDouble != null && valorDouble > 0,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A))
                ) {
                    Text("Confirmar")
                }
            }
        }
    }
}
