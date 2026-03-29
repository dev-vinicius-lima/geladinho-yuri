package com.viniciuslima.mobile.core.network

import com.viniciuslima.mobile.data.remote.api.auth.AuthApi
import com.viniciuslima.mobile.data.remote.api.caixa.CaixaApi
import com.viniciuslima.mobile.data.remote.api.categoria.CategoriaApi
import com.viniciuslima.mobile.data.remote.api.financeiro.FinanceiroApi
import com.viniciuslima.mobile.data.remote.api.produto.ProdutoApi
import com.viniciuslima.mobile.data.remote.api.usuario.UsuarioApi
import com.viniciuslima.mobile.data.remote.api.venda.VendaApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        val client = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .build()
        return Retrofit.Builder()
            .baseUrl("http://192.168.0.13:3000/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi =
        retrofit.create(AuthApi::class.java)

    @Provides
    @Singleton
    fun provideProdutoApi(retrofit: Retrofit): ProdutoApi =
        retrofit.create(ProdutoApi::class.java)

    @Provides
    @Singleton
    fun provideVendaApi(retrofit: Retrofit): VendaApi =
        retrofit.create(VendaApi::class.java)

    @Provides
    @Singleton
    fun provideCaixaApi(retrofit: Retrofit): CaixaApi =
        retrofit.create(CaixaApi::class.java)

    @Provides
    @Singleton
    fun provideCategoriaApi(retrofit: Retrofit): CategoriaApi =
        retrofit.create(CategoriaApi::class.java)

    @Provides
    @Singleton
    fun provideUsuarioApi(retrofit: Retrofit): UsuarioApi =
        retrofit.create(UsuarioApi::class.java)

    @Provides
    @Singleton
    fun provideFinanceiroApi(retrofit: Retrofit): FinanceiroApi =
        retrofit.create(FinanceiroApi::class.java)
}
