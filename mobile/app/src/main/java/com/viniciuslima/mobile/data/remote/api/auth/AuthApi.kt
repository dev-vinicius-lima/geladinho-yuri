package com.viniciuslima.mobile.data.remote.api.auth

import com.viniciuslima.mobile.data.remote.dto.auth.LoginRequestDto
import com.viniciuslima.mobile.data.remote.dto.auth.LoginResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/local/signin")
    suspend fun login(@Body dto: LoginRequestDto): Response<LoginResponseDto>
}
