package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaRequestDto
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaResponseDto
import com.viniciuslima.mobile.data.remote.dto.usuario.WhoAmIResponseDto

interface UsuarioRepository {
    suspend fun whoAmI(token: String): NetworkResult<WhoAmIResponseDto>
    suspend fun changeSenha(token: String, dto: ChangeSenhaRequestDto): NetworkResult<ChangeSenhaResponseDto>
}
