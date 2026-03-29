package com.viniciuslima.mobile.data.repository.usuario

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.usuario.UsuarioApi
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaRequestDto
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaResponseDto
import com.viniciuslima.mobile.data.remote.dto.usuario.WhoAmIResponseDto
import com.viniciuslima.mobile.domain.repository.UsuarioRepository
import javax.inject.Inject

class UsuarioRepositoryImpl @Inject constructor(
    private val api: UsuarioApi
) : UsuarioRepository {

    override suspend fun whoAmI(token: String): NetworkResult<WhoAmIResponseDto> {
        return safeApiCall { api.whoAmI("Bearer $token") }
    }

    override suspend fun changeSenha(token: String, dto: ChangeSenhaRequestDto): NetworkResult<ChangeSenhaResponseDto> {
        return safeApiCall { api.changeSenha("Bearer $token", dto) }
    }
}
