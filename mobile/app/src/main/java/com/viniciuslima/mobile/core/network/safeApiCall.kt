package com.viniciuslima.mobile.core.network

import retrofit2.Response

suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): NetworkResult<T> {
    return try {
        val response = apiCall()
        if (response.isSuccessful) {
            val body = response.body()
            if (body != null) {
                NetworkResult.Success(body)
            } else {
                NetworkResult.Error("Resposta vazia do servidor", response.code())
            }
        } else {
            NetworkResult.Error(response.message(), response.code())
        }
    } catch (e: Exception) {
        NetworkResult.Error(e.localizedMessage ?: "Erro desconhecido")
    }
}
