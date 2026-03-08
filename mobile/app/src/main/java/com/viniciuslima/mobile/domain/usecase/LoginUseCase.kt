package com.viniciuslima.mobile.domain.usecase

import com.viniciuslima.mobile.domain.repository.AuthRepository

class LoginUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(username: String, password: String): Result<Unit> {
        return repository.login(username, password)
    }
}
