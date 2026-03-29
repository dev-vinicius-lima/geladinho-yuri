package com.viniciuslima.mobile.domain.repository

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.auth.LoginRequestDto
import com.viniciuslima.mobile.data.remote.dto.auth.LoginResponseDto

interface AuthRepository {
    suspend fun login(dto: LoginRequestDto): NetworkResult<LoginResponseDto>
}
