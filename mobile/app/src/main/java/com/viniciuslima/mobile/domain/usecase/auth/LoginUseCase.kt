package com.viniciuslima.mobile.domain.usecase.auth

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.auth.LoginRequestDto
import com.viniciuslima.mobile.data.remote.dto.auth.LoginResponseDto
import com.viniciuslima.mobile.data.repository.auth.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(dto: LoginRequestDto): NetworkResult<LoginResponseDto> {
        return repository.login(dto)
    }
}
