package com.viniciuslima.mobile.data.repository.caixa

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.caixa.CaixaApi
import com.viniciuslima.mobile.data.remote.dto.caixa.AbrirCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaAbertoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.CaixaOperacaoResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.FecharCaixaResponseDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SangriaRequestDto
import com.viniciuslima.mobile.data.remote.dto.caixa.SuprimentoRequestDto
import com.viniciuslima.mobile.domain.repository.CaixaRepository
import javax.inject.Inject

class CaixaRepositoryImpl @Inject constructor(
    private val api: CaixaApi
) : CaixaRepository {

    override suspend fun abrir(token: String, dto: AbrirCaixaRequestDto): NetworkResult<CaixaOperacaoResponseDto> {
        return safeApiCall { api.abrir("Bearer $token", dto) }
    }

    override suspend fun fechar(token: String, id: String, dto: FecharCaixaRequestDto): NetworkResult<FecharCaixaResponseDto> {
        return safeApiCall { api.fechar("Bearer $token", id, dto) }
    }

    override suspend fun getAberto(token: String): NetworkResult<CaixaAbertoResponseDto> {
        return safeApiCall { api.getAberto("Bearer $token") }
    }

    override suspend fun sangria(token: String, id: String, dto: SangriaRequestDto): NetworkResult<CaixaOperacaoResponseDto> {
        return safeApiCall { api.sangria("Bearer $token", id, dto) }
    }

    override suspend fun suprimento(token: String, id: String, dto: SuprimentoRequestDto): NetworkResult<CaixaOperacaoResponseDto> {
        return safeApiCall { api.suprimento("Bearer $token", id, dto) }
    }
}
