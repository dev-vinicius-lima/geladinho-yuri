package com.viniciuslima.mobile.core.network

import com.viniciuslima.mobile.data.repository.auth.AuthRepository
import com.viniciuslima.mobile.data.repository.auth.AuthRepositoryImpl
import com.viniciuslima.mobile.data.remote.api.auth.AuthApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    @Provides
    @Singleton
    fun provideAuthRepository(api: AuthApi): AuthRepository =
        AuthRepositoryImpl(api)
}
