package com.viniciuslima.mobile.presentation.produto

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.flow.collectLatest

// =============================================================================
// Tela de Cadastro / Edição de Produto
// =============================================================================
// Recebe produtoId nulo para novo produto, ou o ID para edição.
// Ao salvar com sucesso chama onSalvo() para voltar para o Estoque.
// =============================================================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProdutoFormScreen(
    produtoId: String? = null,
    onVoltar: () -> Unit = {},
    onSalvo: () -> Unit = {},
    viewModel: ProdutoFormViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    // Campos do formulário
    var nome by remember { mutableStateOf("") }
    var preco by remember { mutableStateOf("") }
    var quantidade by remember { mutableStateOf("") }
    var descricao by remember { mutableStateOf("") }
    var precoCusto by remember { mutableStateOf("") }
    var estoqueMinimo by remember { mutableStateOf("") }
    var unidade by remember { mutableStateOf("") }
    var categoriaSelecionadaId by remember { mutableStateOf("") }
    var categoriaDropdownAberto by remember { mutableStateOf(false) }

    // Carrega dados na abertura
    LaunchedEffect(produtoId) {
        viewModel.inicializar(context, produtoId)
    }

    // Pré-preenche campos quando estiver editando
    LaunchedEffect(uiState) {
        val state = uiState as? ProdutoFormUiState.Pronto ?: return@LaunchedEffect
        val p = state.produtoEditando ?: return@LaunchedEffect
        if (nome.isBlank()) {
            nome = p.nome
            preco = p.preco.toString()
            quantidade = p.quantidade.toString()
            descricao = p.descricao ?: ""
            precoCusto = p.preco_custo?.toString() ?: ""
            estoqueMinimo = p.estoque_minimo?.toString() ?: ""
            unidade = p.unidade ?: ""
            categoriaSelecionadaId = p.categoria.id
        }
    }

    // Consome eventos one-shot
    LaunchedEffect(Unit) {
        viewModel.eventos.collectLatest { evento ->
            when (evento) {
                is ProdutoFormEvento.Salvo -> onSalvo()
                is ProdutoFormEvento.Falha -> snackbarHostState.showSnackbar(evento.mensagem)
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (produtoId == null) "Novo Produto" else "Editar Produto",
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onVoltar) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                }
            )
        }
    ) { innerPadding ->
        when (val state = uiState) {
            is ProdutoFormUiState.Carregando -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) { CircularProgressIndicator() }
            }

            is ProdutoFormUiState.Erro -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.mensagem, color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { viewModel.inicializar(context, produtoId) }) {
                            Text("Tentar novamente")
                        }
                    }
                }
            }

            is ProdutoFormUiState.Pronto -> {
                val categoriaSelecionadaNome = state.categorias
                    .firstOrNull { it.id == categoriaSelecionadaId }?.nome ?: "Selecionar categoria"

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Nome *
                    OutlinedTextField(
                        value = nome,
                        onValueChange = { nome = it },
                        label = { Text("Nome *") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    // Preço de venda e quantidade na mesma linha
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedTextField(
                            value = preco,
                            onValueChange = { preco = it },
                            label = { Text("Preço (R$) *") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = quantidade,
                            onValueChange = { quantidade = it },
                            label = { Text(if (produtoId == null) "Qtd inicial *" else "Qtd") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            enabled = true
                        )
                    }

                    // Categoria — dropdown
                    ExposedDropdownMenuBox(
                        expanded = categoriaDropdownAberto,
                        onExpandedChange = { categoriaDropdownAberto = it }
                    ) {
                        OutlinedTextField(
                            value = categoriaSelecionadaNome,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Categoria *") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(categoriaDropdownAberto) },
                            modifier = Modifier.fillMaxWidth().menuAnchor(),
                            shape = RoundedCornerShape(12.dp)
                        )
                        ExposedDropdownMenu(
                            expanded = categoriaDropdownAberto,
                            onDismissRequest = { categoriaDropdownAberto = false }
                        ) {
                            state.categorias.forEach { cat ->
                                DropdownMenuItem(
                                    text = { Text(cat.nome) },
                                    onClick = {
                                        categoriaSelecionadaId = cat.id
                                        categoriaDropdownAberto = false
                                    }
                                )
                            }
                        }
                    }

                    // Descrição
                    OutlinedTextField(
                        value = descricao,
                        onValueChange = { descricao = it },
                        label = { Text("Descrição") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 3
                    )

                    // Preço de custo e estoque mínimo
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedTextField(
                            value = precoCusto,
                            onValueChange = { precoCusto = it },
                            label = { Text("Preço de custo") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = estoqueMinimo,
                            onValueChange = { estoqueMinimo = it },
                            label = { Text("Estoque mínimo") },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true
                        )
                    }

                    // Unidade
                    OutlinedTextField(
                        value = unidade,
                        onValueChange = { unidade = it },
                        label = { Text("Unidade (ex: un, kg, L)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            viewModel.salvar(
                                context = context,
                                produtoId = produtoId,
                                nome = nome,
                                preco = preco,
                                quantidade = quantidade,
                                categoriaId = categoriaSelecionadaId,
                                descricao = descricao,
                                precoComCusto = precoCusto,
                                estoqueMinimo = estoqueMinimo,
                                unidade = unidade,
                            )
                        },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        enabled = !state.salvando
                    ) {
                        if (state.salvando) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = MaterialTheme.colorScheme.onPrimary,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                if (produtoId == null) "Cadastrar Produto" else "Salvar Alterações",
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
