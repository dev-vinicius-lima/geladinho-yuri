package com.viniciuslima.mobile.data.remote.dto.usuario

data class UsuarioDto(
    val id: String,
    val nome: String,
    val email: String,
    val cpf: String,
    val administrador: Boolean,
    val imagem: String?,
)

data class WhoAmIResponseDto(
    val message: String,
    val data: UsuarioDto,
)

data class ChangeSenhaRequestDto(
    val senha_atual: String,
    val nova_senha: String,
)

data class ChangeSenhaResponseDto(
    val message: String,
)
