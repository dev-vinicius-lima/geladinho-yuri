package com.viniciuslima.mobile.presentation.auth.login

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.delay

// =============================================================================
// Tela de Login
// =============================================================================
// Esta é a tela principal de autenticação. Ela é dividida em funções menores
// para ficar mais fácil de ler e entender cada parte separadamente.
//
// Fluxo:
//   1. Usuário digita CPF e senha
//   2. Clica em "Entrar"
//   3. Se der certo → vai para a tela Home
//   4. Se der errado → mostra um aviso no topo da tela
// =============================================================================

@Composable
fun LoginScreen(
    // viewModel é quem gerencia o login (chamada à API, estados de loading/erro)
    viewModel: LoginViewModel = hiltViewModel(),
    // onLoginSuccess é uma função que será chamada quando o login der certo
    onLoginSuccess: () -> Unit = {}
) {
    // Observa o estado atual da tela (Idle, Loading, Success ou Error)
    val uiState by viewModel.uiState.collectAsState()

    // Campos que o usuário digita
    var cpf by remember { mutableStateOf("") }
    var senha by remember { mutableStateOf("") }
    var senhaVisivel by remember { mutableStateOf(false) }

    // Contexto do Android — necessário para salvar os tokens após o login
    val context = LocalContext.current

    // Atalhos para saber em qual estado estamos
    val estaCarregando = uiState is LoginUiState.Loading
    val mensagemErro = (uiState as? LoginUiState.Error)?.message

    // Controla se o toast de erro está visível
    var mostrarToastErro by remember { mutableStateOf(false) }

    // LaunchedEffect executa código quando o estado (uiState) muda
    LaunchedEffect(uiState) {
        when (uiState) {
            is LoginUiState.Success -> onLoginSuccess()
            is LoginUiState.Error -> {
                mostrarToastErro = true
                delay(3000) // espera 3 segundos e some
                mostrarToastErro = false
            }
            else -> Unit
        }
    }

    // Surface é o fundo da tela
    Surface(
        color = MaterialTheme.colorScheme.background,
        modifier = Modifier.fillMaxSize()
    ) {
        // Box permite colocar elementos um em cima do outro
        // Usamos aqui para o toast ficar flutuando sobre o conteúdo
        Box(modifier = Modifier.fillMaxSize()) {

            // Conteúdo principal da tela (logo + campos + botão)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(100.dp))

                LogoSection()

                Spacer(modifier = Modifier.height(32.dp))

                CampoCpf(
                    valor = cpf,
                    habilitado = !estaCarregando,
                    onValorMudou = { novoValor ->
                        // Guarda só os números, limitado a 11 dígitos (tamanho do CPF)
                        val apenasDigitos = novoValor.filter { it.isDigit() }
                        if (apenasDigitos.length <= 11) cpf = apenasDigitos
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                CampoSenha(
                    valor = senha,
                    habilitado = !estaCarregando,
                    senhaVisivel = senhaVisivel,
                    onValorMudou = { senha = it },
                    onAlternarVisibilidade = { senhaVisivel = !senhaVisivel }
                )

                Spacer(modifier = Modifier.height(8.dp))

                Spacer(modifier = Modifier.height(32.dp))

                BotaoEntrar(
                    estaCarregando = estaCarregando,
                    onClick = { viewModel.login(cpf, senha, context) }
                )

                Spacer(modifier = Modifier.height(24.dp))

                TextoRodape()
            }

            // Toast de erro — aparece no topo quando o login falha
            ToastErro(
                visivel = mostrarToastErro,
                mensagem = mensagemErro ?: ""
            )
        }
    }
}

// =============================================================================
// Logo: ícone circular + nome do app + subtítulo
// =============================================================================
@Composable
private fun LogoSection() {
    Surface(
        shape = CircleShape,
        color = Color(0xFFEFF4FF),
        modifier = Modifier.size(120.dp)
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
            Icon(
                Icons.Filled.Home,
                contentDescription = "Logo",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(64.dp)
            )
        }
    }

    Spacer(modifier = Modifier.height(32.dp))

    Text(
        text = "Geladinho do Yuri",
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        color = Color(0xFF1C1B1F),
        textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(8.dp))

    Text(
        text = "Gestão simples para o seu negócio",
        fontSize = 16.sp,
        color = Color(0xFF7B7B7B),
        textAlign = TextAlign.Center
    )
}

// =============================================================================
// Campo de CPF — formata automaticamente como 000.000.000-00 enquanto digita
// =============================================================================
@Composable
private fun CampoCpf(
    valor: String,
    habilitado: Boolean,
    onValorMudou: (String) -> Unit
) {
    TextField(
        value = valor,
        onValueChange = onValorMudou,
        label = { Text("CPF") },
        leadingIcon = { Icon(Icons.Filled.Person, contentDescription = "CPF") },
        // Aplica a máscara visual 000.000.000-00 (o valor real continua sem máscara)
        visualTransformation = CpfVisualTransformation(),
        // Abre o teclado numérico no celular
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(16.dp),
        enabled = habilitado,
        colors = campoCores()
    )
}

// =============================================================================
// Campo de Senha — com botão para mostrar/ocultar a senha
// =============================================================================
@Composable
private fun CampoSenha(
    valor: String,
    habilitado: Boolean,
    senhaVisivel: Boolean,
    onValorMudou: (String) -> Unit,
    onAlternarVisibilidade: () -> Unit
) {
    TextField(
        value = valor,
        onValueChange = onValorMudou,
        label = { Text("Senha") },
        leadingIcon = { Icon(Icons.Filled.Lock, contentDescription = "Senha") },
        trailingIcon = {
            // Botão de olho para mostrar/esconder a senha
            IconButton(onClick = onAlternarVisibilidade) {
                Icon(
                    imageVector = if (senhaVisivel) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                    contentDescription = if (senhaVisivel) "Ocultar senha" else "Mostrar senha"
                )
            }
        },
        // Se senhaVisivel for false, mostra bolinhas no lugar dos caracteres
        visualTransformation = if (senhaVisivel) VisualTransformation.None else PasswordVisualTransformation(),
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        shape = RoundedCornerShape(16.dp),
        enabled = habilitado,
        colors = campoCores()
    )
}

// =============================================================================
// Botão de entrar — mostra um círculo giratório enquanto está carregando
// =============================================================================
@Composable
private fun BotaoEntrar(
    estaCarregando: Boolean,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        enabled = !estaCarregando,
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
        )
    ) {
        if (estaCarregando) {
            // Ícone de carregamento enquanto a API responde
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary
            )
        } else {
            Text("Entrar", fontSize = 20.sp)
        }
    }
}

// =============================================================================
// Textos do rodapé (termos de uso e versão do app)
// =============================================================================
@Composable
private fun TextoRodape() {
    Text(
        text = "Ao entrar, você concorda com nossos Termos e Política de Privacidade.",
        color = Color(0xFF7B7B7B),
        fontSize = 14.sp,
        textAlign = TextAlign.Center
    )
    Spacer(modifier = Modifier.height(16.dp))
    Text(
        text = "Vinicius Lima Versao 1.0.0",
        color = Color(0xFFBDBDBD),
        fontSize = 12.sp,
        modifier = Modifier.fillMaxWidth(),
        textAlign = TextAlign.Center
    )
}

// =============================================================================
// Toast de erro — aparece deslizando do topo e some após 3 segundos
// =============================================================================
@Composable
private fun BoxScope.ToastErro(visivel: Boolean, mensagem: String) {
    AnimatedVisibility(
        visible = visivel,
        // Animação de entrada: desliza de cima para baixo
        enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
        // Animação de saída: desliza de baixo para cima
        exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
        modifier = Modifier
            .align(Alignment.TopCenter)
            .padding(top = 16.dp, start = 16.dp, end = 16.dp)
    ) {
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Filled.Warning,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = mensagem,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    fontSize = 14.sp,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

// =============================================================================
// Cores padrão dos campos de texto (CPF e Senha)
// Extraído para não repetir o mesmo bloco de cores nos dois campos
// =============================================================================
@Composable
private fun campoCores() = TextFieldDefaults.colors(
    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
    focusedContainerColor = MaterialTheme.colorScheme.surface,
    focusedIndicatorColor = MaterialTheme.colorScheme.primary,
    unfocusedIndicatorColor = MaterialTheme.colorScheme.secondary,
    unfocusedLabelColor = Color(0xFF7B7B7B),
    focusedLabelColor = MaterialTheme.colorScheme.primary
)
