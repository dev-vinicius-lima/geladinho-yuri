package com.viniciuslima.mobile.domain.usecase.usuario

import com.viniciuslima.mobile.core.network.NetworkResult
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaRequestDto
import com.viniciuslima.mobile.data.remote.dto.usuario.ChangeSenhaResponseDto
import com.viniciuslima.mobile.domain.repository.UsuarioRepository
import javax.inject.Inject

class ChangeSenhaUseCase @Inject constructor(
    private val repository: UsuarioRepository
) {
    suspend operator fun invoke(token: String, senhaAtual: String, novaSenha: String): NetworkResult<ChangeSenhaResponseDto> {
        return repository.changeSenha(token, ChangeSenhaRequestDto(senhaAtual, novaSenha))
    }
}
