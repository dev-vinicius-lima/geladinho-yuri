package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.RemoveCircle
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
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaDataDto
import com.viniciuslima.mobile.data.remote.dto.produto.ProdutoDto
import com.viniciuslima.mobile.ui.theme.BluePrimary
import com.viniciuslima.mobile.ui.theme.SuccessGreen
import kotlinx.coroutines.flow.collectLatest

// =============================================================================
// Tela PDV — integrada com Caixa
// =============================================================================
// Fluxo:
//   1. Ao abrir verifica se há caixa aberto
//   2. Se não → AbrirCaixaDialog é exibido automaticamente
//   3. Com caixa aberto → PDV normal + botões Sangria / Suprimento / Fechar Caixa
//   4. Finalizar venda só é possível com caixa aberto
// =============================================================================

@Composable
fun PDVScreen(
    onVendaFinalizada: () -> Unit = {},
    pdvViewModel: PDVViewModel = hiltViewModel(),
    caixaViewModel: CaixaViewModel = hiltViewModel()
) {
    val pdvUiState by pdvViewModel.uiState.collectAsState()
    val caixaUiState by caixaViewModel.uiState.collectAsState()
    val carrinho by pdvViewModel.carrinho.collectAsState()
    val formaPagamento: String? by pdvViewModel.formaPagamento.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    // Controle dos dialogs
    var mostrarAbrirCaixa by remember { mutableStateOf(false) }
    var mostrarFecharCaixa by remember { mutableStateOf(false) }
    var mostrarSangria by remember { mutableStateOf(false) }
    var mostrarSuprimento by remember { mutableStateOf(false) }
    var resultadoFechamento by remember { mutableStateOf<FecharCaixaDataDto?>(null) }

    // Carrega dados ao abrir a tela
    LaunchedEffect(Unit) {
        pdvViewModel.carregarProdutos(context)
        caixaViewModel.verificarCaixa(context)
    }

    // Abre o dialog de abertura de caixa quando não há caixa aberto
    LaunchedEffect(caixaUiState) {
        if (caixaUiState is CaixaUiState.SemCaixa) {
            mostrarAbrirCaixa = true
        }
        if (caixaUiState is CaixaUiState.CaixaAberto) {
            mostrarAbrirCaixa = false
        }
    }

    // Consome eventos one-shot do CaixaViewModel (snackbar, resultado fechamento)
    LaunchedEffect(Unit) {
        caixaViewModel.eventos.collectLatest { evento ->
            when (evento) {
                is CaixaEvento.Sucesso -> snackbarHostState.showSnackbar(evento.mensagem)
                is CaixaEvento.Falha -> snackbarHostState.showSnackbar("Erro: ${evento.mensagem}")
                is CaixaEvento.CaixaFechado -> resultadoFechamento = evento.resultado
            }
        }
    }

    // Quando a venda for finalizada, volta para Home
    LaunchedEffect(pdvUiState) {
        if (pdvUiState is PdvUiState.VendaFinalizada) {
            onVendaFinalizada()
        }
    }

    // -------------------------------------------------------------------------
    // Dialogs do Caixa
    // -------------------------------------------------------------------------

    if (mostrarAbrirCaixa) {
        AbrirCaixaDialog(
            onConfirmar = { valor ->
                mostrarAbrirCaixa = false
                caixaViewModel.abrirCaixa(context, valor)
            },
            onDismiss = { mostrarAbrirCaixa = false }
        )
    }

    if (mostrarFecharCaixa) {
        val saldo = (caixaUiState as? CaixaUiState.CaixaAberto)?.caixa?.saldo_esperado ?: 0.0
        FecharCaixaDialog(
            saldoEsperado = saldo,
            onConfirmar = { valor ->
                mostrarFecharCaixa = false
                caixaViewModel.fecharCaixa(context, valor)
            },
            onDismiss = { mostrarFecharCaixa = false }
        )
    }

    if (mostrarSangria) {
        SangriaDialog(
            onConfirmar = { valor, descricao ->
                mostrarSangria = false
                caixaViewModel.registrarSangria(context, valor, descricao)
            },
            onDismiss = { mostrarSangria = false }
        )
    }

    if (mostrarSuprimento) {
        SuprimentoDialog(
            onConfirmar = { valor, descricao ->
                mostrarSuprimento = false
                caixaViewModel.registrarSuprimento(context, valor, descricao)
            },
            onDismiss = { mostrarSuprimento = false }
        )
    }

    resultadoFechamento?.let { resultado ->
        ResultadoFechamentoDialog(
            resultado = resultado,
            onDismiss = { resultadoFechamento = null }
        )
    }

    // -------------------------------------------------------------------------
    // Layout principal
    // -------------------------------------------------------------------------

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            // Cabeçalho com status do caixa
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Ponto de Venda (PDV)",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
                CaixaStatusChip(caixaUiState)
            }

            // Botões de operação do caixa (visíveis apenas com caixa aberto)
            if (caixaUiState is CaixaUiState.CaixaAberto) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { mostrarSangria = true },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Filled.RemoveCircle, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Sangria", fontSize = 12.sp)
                    }
                    OutlinedButton(
                        onClick = { mostrarSuprimento = true },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Filled.AddCircle, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Suprimento", fontSize = 12.sp)
                    }
                    OutlinedButton(
                        onClick = { mostrarFecharCaixa = true },
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Icon(Icons.Filled.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Fechar", fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Conteúdo do PDV — bloqueado se não há caixa aberto
            when (val state = pdvUiState) {
                is PdvUiState.Carregando -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }

                is PdvUiState.Erro -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(state.mensagem, color = MaterialTheme.colorScheme.error)
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(onClick = { pdvViewModel.carregarProdutos(context) }) {
                                Text("Tentar novamente")
                            }
                        }
                    }
                }

                is PdvUiState.Pronto, is PdvUiState.VendaFinalizada -> {
                    val produtos = (state as? PdvUiState.Pronto)?.produtos ?: emptyList()
                    val caixaAberto = caixaUiState is CaixaUiState.CaixaAberto

                    Text(
                        text = "Produtos",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(produtos) { produto ->
                            ProdutoCard(
                                produto = produto,
                                quantidadeNoCarrinho = carrinho[produto.id]?.quantidade ?: 0,
                                habilitado = caixaAberto,
                                onAdicionar = { pdvViewModel.adicionarProduto(produto) },
                                onRemover = { pdvViewModel.removerProduto(produto.id) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Resumo do carrinho
                    if (carrinho.isNotEmpty()) {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    "Itens da Venda",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                carrinho.values.forEach { item ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 2.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            "${item.quantidade}x ${item.produto.nome}",
                                            fontSize = 14.sp,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Text(
                                            "R$ ${"%.2f".format(item.produto.preco * item.quantidade)}",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                }
                                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Total:", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                    Text(
                                        "R$ ${"%.2f".format(pdvViewModel.total)}",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 22.sp,
                                        color = BluePrimary
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    // Seletor de forma de pagamento
                    if (carrinho.isNotEmpty() && caixaAberto) {
                        val labels = mapOf(
                            "dinheiro" to "Dinheiro",
                            "pix" to "Pix",
                            "cartao_credito" to "Crédito",
                            "cartao_debito" to "Débito"
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            pdvViewModel.formasPagamento.forEach { forma ->
                                val selecionado = formaPagamento == forma
                                FilterChip(
                                    selected = selecionado,
                                    onClick = { pdvViewModel.selecionarFormaPagamento(forma) },
                                    label = { Text(labels[forma] ?: forma, fontSize = 12.sp) }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Botão finalizar — desativado se não há caixa aberto
                    Button(
                        onClick = { pdvViewModel.finalizarVenda(context) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = carrinho.isNotEmpty() && caixaAberto && formaPagamento != null,
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen)
                    ) {
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            if (caixaAberto) "Finalizar Venda" else "Abra o caixa para vender",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

// =============================================================================
// Chip de status do caixa no cabeçalho
// =============================================================================

@Composable
private fun CaixaStatusChip(state: CaixaUiState) {
    val (texto, cor) = when (state) {
        is CaixaUiState.CaixaAberto -> "Caixa Aberto" to Color(0xFF16A34A)
        is CaixaUiState.SemCaixa -> "Sem Caixa" to MaterialTheme.colorScheme.error
        is CaixaUiState.Carregando -> "..." to Color.Gray
        is CaixaUiState.Erro -> "Erro" to MaterialTheme.colorScheme.error
    }
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = cor.copy(alpha = 0.12f)
    ) {
        Text(
            text = texto,
            color = cor,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
        )
    }
}

// =============================================================================
// Card de produto — agora recebe parâmetro `habilitado`
// =============================================================================

@Composable
private fun ProdutoCard(
    produto: ProdutoDto,
    quantidadeNoCarrinho: Int,
    habilitado: Boolean,
    onAdicionar: () -> Unit,
    onRemover: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(produto.nome, fontWeight = FontWeight.Bold)
                Text(
                    "R$ ${"%.2f".format(produto.preco)}  |  Estoque: ${produto.quantidade}",
                    fontSize = 13.sp,
                    color = Color.Gray
                )
            }

            if (quantidadeNoCarrinho > 0) {
                IconButton(
                    onClick = onRemover,
                    modifier = Modifier.size(32.dp),
                    enabled = habilitado
                ) {
                    Icon(Icons.Filled.Remove, contentDescription = "Remover", tint = MaterialTheme.colorScheme.error)
                }
                Text(
                    "$quantidadeNoCarrinho",
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }

            IconButton(
                onClick = onAdicionar,
                modifier = Modifier.size(32.dp),
                enabled = habilitado && produto.quantidade > quantidadeNoCarrinho
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Adicionar", tint = SuccessGreen)
            }
        }
    }
}
