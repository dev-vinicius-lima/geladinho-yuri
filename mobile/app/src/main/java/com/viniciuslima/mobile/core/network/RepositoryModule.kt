package com.viniciuslima.mobile.core.network

import com.viniciuslima.mobile.data.remote.api.auth.AuthApi
import com.viniciuslima.mobile.data.remote.api.caixa.CaixaApi
import com.viniciuslima.mobile.data.remote.api.categoria.CategoriaApi
import com.viniciuslima.mobile.data.remote.api.financeiro.FinanceiroApi
import com.viniciuslima.mobile.data.remote.api.produto.ProdutoApi
import com.viniciuslima.mobile.data.remote.api.usuario.UsuarioApi
import com.viniciuslima.mobile.data.remote.api.venda.VendaApi
import com.viniciuslima.mobile.data.repository.auth.AuthRepositoryImpl
import com.viniciuslima.mobile.data.repository.caixa.CaixaRepositoryImpl
import com.viniciuslima.mobile.data.repository.categoria.CategoriaRepositoryImpl
import com.viniciuslima.mobile.data.repository.financeiro.FinanceiroRepositoryImpl
import com.viniciuslima.mobile.data.repository.produto.ProdutoRepositoryImpl
import com.viniciuslima.mobile.data.repository.usuario.UsuarioRepositoryImpl
import com.viniciuslima.mobile.data.repository.venda.VendaRepositoryImpl
import com.viniciuslima.mobile.domain.repository.AuthRepository
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import com.viniciuslima.mobile.domain.repository.CategoriaRepository
import com.viniciuslima.mobile.domain.repository.FinanceiroRepository
import com.viniciuslima.mobile.domain.repository.ProdutoRepository
import com.viniciuslima.mobile.domain.repository.UsuarioRepository
import com.viniciuslima.mobile.domain.repository.VendaRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthRepository(api: AuthApi): AuthRepository =
        AuthRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideProdutoRepository(api: ProdutoApi): ProdutoRepository =
        ProdutoRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideVendaRepository(api: VendaApi): VendaRepository =
        VendaRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideCaixaRepository(api: CaixaApi): CaixaRepository =
        CaixaRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideCategoriaRepository(api: CategoriaApi): CategoriaRepository =
        CategoriaRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideUsuarioRepository(api: UsuarioApi): UsuarioRepository =
        UsuarioRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideFinanceiroRepository(api: FinanceiroApi): FinanceiroRepository =
        FinanceiroRepositoryImpl(api)
}
