package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.viniciuslima.mobile.ui.theme.BluePrimary
import com.viniciuslima.mobile.ui.theme.SuccessGreen

@Composable
fun PDVScreen() {
    var search by remember { mutableStateOf("") }
    val itens = remember {
        mutableStateListOf(
            PDVItem("Coca-Cola Lata 350ml", 2, 5.50),
            PDVItem("Geladinho Uva", 1, 2.00)
        )
    }
    val total = itens.sumOf { it.qtd * it.preco }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Ponto de Venda (PDV)",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        // Campo de busca
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            label = { Text("Buscar produto ou código") },
            leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = TextFieldDefaults.colors(
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                focusedContainerColor = MaterialTheme.colorScheme.surface
            )
        )
        Spacer(modifier = Modifier.height(20.dp))
        // Lista de itens
        Text(
            text = "Itens da Venda",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        if (itens.isEmpty()) {
            Text("Nenhum item adicionado.", color = Color.Gray)
        } else {
            Column(
                modifier = Modifier.weight(1f, fill = false)
            ) {
                itens.forEach { item ->
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
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.nome, fontWeight = FontWeight.Bold)
                                Text("Qtd: ${item.qtd}  |  R$ ${"%.2f".format(item.preco)}", fontSize = 14.sp, color = Color.Gray)
                            }
                            Text(
                                "R$ ${"%.2f".format(item.qtd * item.preco)}",
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(12.dp))
        // Totalização
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Total:", fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    "R$ ${"%.2f".format(total)}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    color = BluePrimary
                )
            }
        }
        Spacer(modifier = Modifier.height(20.dp))
        // Botão finalizar venda
        Button(
            onClick = { /* ação de finalizar venda */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
        ) {
            Icon(Icons.Filled.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Finalizar Venda", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}

data class PDVItem(val nome: String, val qtd: Int, val preco: Double)
