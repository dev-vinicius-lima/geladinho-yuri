package com.viniciuslima.mobile.data.remote.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequestDto(
    val cpf: String,
    val senha: String
)
