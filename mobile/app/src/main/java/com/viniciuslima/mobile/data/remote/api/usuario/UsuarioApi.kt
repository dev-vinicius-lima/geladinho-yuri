package com.viniciuslima.mobile.data.remote.api.usuario

import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaRequestDto
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaResponseDto
import com.viniciuslima.mobile.data.remote.dto.usuario.WhoAmIResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH

interface UsuarioApi {

    @GET("auth/local/whoami")
    suspend fun whoAmI(
        @Header("Authorization") token: String
    ): Response<WhoAmIResponseDto>

    @PATCH("usuario/senha")
    suspend fun changeSenha(
        @Header("Authorization") token: String,
        @Body dto: ChangeSenhaRequestDto
    ): Response<ChangeSenhaResponseDto>
}
