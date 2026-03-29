package com.viniciuslima.mobile.data.remote.api.caixa

import com.viniciuslima.mobile.data.remote.dto.caixa.AbrirCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaAbertoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaOperacaoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SangriaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SuprimentoRequestDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

interface CaixaApi {

    // Abre um novo caixa para o operador logado
    @POST("caixa/abrir")
    suspend fun abrir(
        @Header("Authorization") token: String,
        @Body dto: AbrirCaixaRequestDto
    ): Response<CaixaOperacaoResponseDto>

    // Fecha o caixa pelo id — calcula saldo_esperado e diferenca
    @POST("caixa/{id}/fechar")
    suspend fun fechar(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body dto: FecharCaixaRequestDto
    ): Response<FecharCaixaResponseDto>

    // Retorna o caixa aberto do operador logado (data = null se não houver)
    @GET("caixa/aberto")
    suspend fun getAberto(
        @Header("Authorization") token: String
    ): Response<CaixaAbertoResponseDto>

    // Registra uma sangria (retirada de dinheiro)
    @POST("caixa/{id}/sangria")
    suspend fun sangria(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body dto: SangriaRequestDto
    ): Response<CaixaOperacaoResponseDto>

    // Registra um suprimento (entrada de dinheiro)
    @POST("caixa/{id}/suprimento")
    suspend fun suprimento(
        @Header("Authorization") token: String,
        @Path("id") id: String,
        @Body dto: SuprimentoRequestDto
    ): Response<CaixaOperacaoResponseDto>
}
