package com.viniciuslima.mobile.data.remote.dto.auth

data class LoginResponseDto(
    val access_token: String,
    val refresh_token: String,
)
