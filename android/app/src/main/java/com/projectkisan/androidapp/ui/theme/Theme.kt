package com.projectkisan.androidapp.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// ▼▼▼ UPDATED darkColorScheme ▼▼▼
private val DarkColorScheme = darkColorScheme(
    primary = GreenPrimary,
    secondary = BlueSecondary,
    background = DarkBackground,
    surface = DarkCard, // Use our new card color
    onPrimary = White,
    onSecondary = White,
    onBackground = DarkTextPrimary, // Use our new text color
    onSurface = DarkTextPrimary,    // Use our new text color for text on cards
    onSurfaceVariant = DarkTextMuted // Use for muted text
)

private val LightColorScheme = lightColorScheme(
    primary = GreenPrimary,
    secondary = BlueSecondary,
    background = BackgroundLight,
    surface = CardLight,
    onPrimary = White,
    onSecondary = White,
    onBackground = TextPrimaryLight,
    onSurface = TextPrimaryLight,
    onSurfaceVariant = TextMutedLight // Use for muted text
)

@Composable
fun ProjectKisanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}