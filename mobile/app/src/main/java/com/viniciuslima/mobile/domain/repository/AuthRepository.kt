package com.viniciuslima.mobile.domain.repository

interface AuthRepository {
    suspend fun login(username: String, password: String): Result<Unit>
}
