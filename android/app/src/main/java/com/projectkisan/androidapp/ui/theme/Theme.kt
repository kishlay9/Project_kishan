package com.projectkisan.androidapp.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryGreen,
    secondary = PrimaryBlue,
    background = DarkThemeBackground,
    surface = DarkThemeCard,
    onPrimary = DarkThemePrimaryText,
    onSecondary = DarkThemePrimaryText,
    onBackground = DarkThemePrimaryText,
    onSurface = DarkThemePrimaryText
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryGreen,
    secondary = PrimaryBlue,
    background = LightGrayBackground,
    surface = CardBackground,
    onPrimary = White,
    onSecondary = White,
    onBackground = TextColor,
    onSurface = TextColor
)

@Composable
fun ProjectKisanTheme(
    darkTheme: Boolean = true, // Forcing dark theme to match the screenshot
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false, // Disabled for consistent branding
    content: @Composable () -> Unit
) {
    // ▼▼▼ FIX: The 'when' block now has an 'else' and is exhaustive ▼▼▼
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme // This 'else' branch is required by the compiler
    }
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