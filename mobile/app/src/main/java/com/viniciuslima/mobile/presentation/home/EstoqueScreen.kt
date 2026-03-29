package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
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
import com.viniciuslima.mobile.ui.theme.ErrorRed

@Composable
fun EstoqueScreen(
    onNovoProduto: () -> Unit = {},
    onEditarProduto: (String) -> Unit = {},
    viewModel: EstoqueViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var search by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        viewModel.carregarProdutos(context)
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNovoProduto,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Novo produto", tint = Color.White)
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            Text(
                text = "Estoque",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(16.dp))

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

            Spacer(modifier = Modifier.height(16.dp))

            when (val state = uiState) {
                is EstoqueUiState.Carregando -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }

                is EstoqueUiState.Erro -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(state.mensagem, color = MaterialTheme.colorScheme.error)
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(onClick = { viewModel.carregarProdutos(context) }) {
                                Text("Tentar novamente")
                            }
                        }
                    }
                }

                is EstoqueUiState.Pronto -> {
                    // Filtra pelo campo de busca
                    val produtosFiltrados = state.produtos.filter {
                        it.nome.contains(search, ignoreCase = true)
                    }
                    val criticos = produtosFiltrados.filter { p ->
                        p.estoque_minimo != null && p.quantidade <= p.estoque_minimo
                    }

                    // Alerta de estoque crítico
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
                                    Text(
                                        "Estoque Crítico",
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onBackground
                                    )
                                    Text(
                                        "${criticos.size} produto(s) com baixo estoque",
                                        color = Color(0xFF7B7B7B),
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    Text(
                        text = "Produtos (${produtosFiltrados.size})",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    if (produtosFiltrados.isEmpty()) {
                        Text("Nenhum produto encontrado.", color = Color.Gray)
                    } else {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(produtosFiltrados) { produto ->
                                Card(
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.surface
                                    ),
                                    onClick = { onEditarProduto(produto.id) }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        val estoqueBaixo = produto.estoque_minimo != null && produto.quantidade <= produto.estoque_minimo
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(produto.nome, fontWeight = FontWeight.Bold)
                                            Text(
                                                "Qtd: ${produto.quantidade}  |  R$ ${"%.2f".format(produto.preco)}",
                                                fontSize = 13.sp,
                                                color = if (estoqueBaixo) ErrorRed else Color.Gray
                                            )
                                            Row(
                                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    produto.categoria.nome,
                                                    fontSize = 12.sp,
                                                    color = MaterialTheme.colorScheme.primary
                                                )
                                                if (estoqueBaixo) {
                                                    Surface(
                                                        shape = RoundedCornerShape(4.dp),
                                                        color = ErrorRed.copy(alpha = 0.12f)
                                                    ) {
                                                        Text(
                                                            "Estoque Baixo",
                                                            fontSize = 11.sp,
                                                            color = ErrorRed,
                                                            fontWeight = FontWeight.SemiBold,
                                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                        if (produto.estoque_minimo != null && produto.quantidade <= produto.estoque_minimo) {
                                            Icon(
                                                Icons.Filled.Warning,
                                                contentDescription = null,
                                                tint = ErrorRed,
                                                modifier = Modifier.size(18.dp)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                        }
                                        Icon(
                                            Icons.Filled.Edit,
                                            contentDescription = "Editar produto",
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
