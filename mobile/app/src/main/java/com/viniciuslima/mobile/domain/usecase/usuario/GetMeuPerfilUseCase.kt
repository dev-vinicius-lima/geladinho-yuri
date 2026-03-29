package com.viniciuslima.mobile.domain.usecase.usuario

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.usuario.WhoAmIResponseDto
import com.viniciuslima.mobile.domain.repository.UsuarioRepository
import javax.inject.Inject

class GetMeuPerfilUseCase @Inject constructor(
    private val repository: UsuarioRepository
) {
    suspend operator fun invoke(token: String): NetworkResult<WhoAmIResponseDto> {
        return repository.whoAmI(token)
    }
}
