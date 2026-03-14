package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.viniciuslima.mobile.ui.theme.ErrorRed

@Composable
fun EstoqueScreen() {
    var search by remember { mutableStateOf("") }
    val produtos = remember {
        listOf(
            ProdutoEstoque("Geladinho Uva", 8, "Unidade"),
            ProdutoEstoque("Coca-Cola Lata 350ml", 2, "Unidade"),
            ProdutoEstoque("Água Mineral 500ml", 15, "Unidade"),
            ProdutoEstoque("Geladinho Morango", 1, "Unidade")
        )
    }
    val produtosFiltrados = produtos.filter {
        it.nome.contains(search, ignoreCase = true)
    }
    val criticos = produtosFiltrados.filter { it.qtd <= 5 }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Estoque",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        // Campo de busca
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            label = { Text("Buscar produto") },
            leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = TextFieldDefaults.colors(
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                focusedContainerColor = MaterialTheme.colorScheme.surface
            )
        )
        Spacer(modifier = Modifier.height(20.dp))
        // Estoque crítico
        if (criticos.isNotEmpty()) {
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
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Estoque Crítico", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
                        Text("${criticos.size} produto(s) com baixo estoque", color = Color(0xFF7B7B7B), fontSize = 14.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
        // Lista de produtos
        Text(
            text = "Produtos",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        if (produtosFiltrados.isEmpty()) {
            Text("Nenhum produto encontrado.", color = Color.Gray)
        } else {
            Column(
                modifier = Modifier.weight(1f, fill = false)
            ) {
                produtosFiltrados.forEach { produto ->
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
                                Text(produto.nome, fontWeight = FontWeight.Bold)
                                Text("Qtd: ${produto.qtd} ${produto.unidade}", fontSize = 14.sp, color = if (produto.qtd <= 5) ErrorRed else Color.Gray)
                            }
                        }
                    }
                }
            }
        }
    }
}

data class ProdutoEstoque(val nome: String, val qtd: Int, val unidade: String)

