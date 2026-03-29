package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.caixa.AbrirCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaAbertoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaOperacaoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SangriaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SuprimentoRequestDto

interface CaixaRepository {
    suspend fun abrir(token: String, dto: AbrirCaixaRequestDto): NetworkResult<CaixaOperacaoResponseDto>
    suspend fun fechar(token: String, id: String, dto: FecharCaixaRequestDto): NetworkResult<FecharCaixaResponseDto>
    suspend fun getAberto(token: String): NetworkResult<CaixaAbertoResponseDto>
    suspend fun sangria(token: String, id: String, dto: SangriaRequestDto): NetworkResult<CaixaOperacaoResponseDto>
    suspend fun suprimento(token: String, id: String, dto: SuprimentoRequestDto): NetworkResult<CaixaOperacaoResponseDto>
}
