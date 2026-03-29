package com.viniciuslima.mobile.data.remote.dto.categoria

data class CategoriaItemDto(
    val id: String,
    val nome: String,
)

data class CategoriaListResponseDto(
    val message: String,
    val data: List<CategoriaItemDto>
)
