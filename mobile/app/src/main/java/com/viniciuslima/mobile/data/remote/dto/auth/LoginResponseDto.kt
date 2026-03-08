package com.viniciuslima.mobile.data.remote.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class LoginResponseDto(
    val access_token: String,
    val refresh_token: String,
    // Adicione outros campos retornados pela API se necessário
)
