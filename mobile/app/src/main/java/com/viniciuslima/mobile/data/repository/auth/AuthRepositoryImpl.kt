package com.viniciuslima.mobile.data.repository.auth

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.core.network.safeApiCall
import com.viniciuslima.mobile.data.remote.api.auth.AuthApi
import com.viniciuslima.mobile.data.remote.dto.auth.LoginRequestDto
import com.viniciuslima.mobile.data.remote.dto.auth.LoginResponseDto
import com.viniciuslima.mobile.domain.repository.AuthRepository
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi
) : AuthRepository {
    override suspend fun login(dto: LoginRequestDto): NetworkResult<LoginResponseDto> {
        return safeApiCall { api.login(dto) }
    }
}
