package com.viniciuslima.mobile.ui.theme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color



private val LightColorScheme = lightColorScheme(
    primary = BluePrimary,
    onPrimary = White,
    secondary = BlueSecondary,
    onSecondary = White,
    background = BackgroundGray,
    onBackground = Color(0xFF1C1B1F),
    surface = CardGray,
    onSurface = Color(0xFF1C1B1F),
    error = ErrorRed,
    onError = White,
    tertiary = SuccessGreen,
    onTertiary = White
)

@Composable
fun MobileTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}