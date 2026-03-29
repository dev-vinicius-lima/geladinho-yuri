package com.viniciuslima.mobile.presentation.home

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.viniciuslima.mobile.presentation.perfil.PerfilScreen
import com.viniciuslima.mobile.presentation.produto.ProdutoFormScreen

// Rotas da navegação interna (dentro do home)
object HomeRoutes {
    const val HOME = "home"
    const val PDV = "pdv"
    const val ESTOQUE = "estoque"
    const val FINANCAS = "financas"
    const val PERFIL = "perfil"
    const val PRODUTO_NOVO = "produto/form"
    const val PRODUTO_EDITAR = "produto/form/{produtoId}"

    fun produtoEditar(id: String) = "produto/form/$id"
}

@Composable
fun MainHomeScreen() {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            // Mostra a barra apenas nas abas principais
            val rotasSemBottomBar = setOf(
                HomeRoutes.PERFIL,
                HomeRoutes.PRODUTO_NOVO,
                HomeRoutes.PRODUTO_EDITAR
            )
            val rotaAtual = navController
                .currentBackStackEntry
                ?.destination?.route

            // Exibe bottom bar apenas nas 4 abas principais
            val mostrarBottomBar = rotaAtual != HomeRoutes.PERFIL &&
                    rotaAtual != HomeRoutes.PRODUTO_NOVO &&
                    rotaAtual?.startsWith("produto/form/") != true

            if (mostrarBottomBar) {
                BottomNavigationBar(navController)
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding).fillMaxSize()) {
            NavHost(navController = navController, startDestination = HomeRoutes.HOME) {

                composable(HomeRoutes.HOME) {
                    HomeScreen(
                        onAbrirPdv = { navController.navigate(HomeRoutes.PDV) },
                        onNovoProduto = { navController.navigate(HomeRoutes.PRODUTO_NOVO) },
                        onAbrirPerfil = { navController.navigate(HomeRoutes.PERFIL) },
                        onAbrirEstoque = { navController.navigate(HomeRoutes.ESTOQUE) }
                    )
                }

                composable(HomeRoutes.PDV) {
                    PDVScreen(
                        onVendaFinalizada = {
                            navController.navigate(HomeRoutes.HOME) {
                                popUpTo(HomeRoutes.HOME) { inclusive = true }
                            }
                        }
                    )
                }

                composable(HomeRoutes.ESTOQUE) {
                    EstoqueScreen(
                        onNovoProduto = { navController.navigate(HomeRoutes.PRODUTO_NOVO) },
                        onEditarProduto = { id -> navController.navigate(HomeRoutes.produtoEditar(id)) }
                    )
                }

                composable(HomeRoutes.FINANCAS) {
                    FinancasScreen()
                }

                composable(HomeRoutes.PERFIL) {
                    PerfilScreen(onVoltar = { navController.popBackStack() })
                }

                // Novo produto
                composable(HomeRoutes.PRODUTO_NOVO) {
                    ProdutoFormScreen(
                        produtoId = null,
                        onVoltar = { navController.popBackStack() },
                        onSalvo = {
                            navController.navigate(HomeRoutes.ESTOQUE) {
                                popUpTo(HomeRoutes.ESTOQUE) { inclusive = true }
                            }
                        }
                    )
                }

                // Editar produto existente
                composable(
                    route = HomeRoutes.PRODUTO_EDITAR,
                    arguments = listOf(navArgument("produtoId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val produtoId = backStackEntry.arguments?.getString("produtoId")
                    ProdutoFormScreen(
                        produtoId = produtoId,
                        onVoltar = { navController.popBackStack() },
                        onSalvo = {
                            navController.navigate(HomeRoutes.ESTOQUE) {
                                popUpTo(HomeRoutes.ESTOQUE) { inclusive = true }
                            }
                        }
                    )
                }
            }
        }
    }
}
