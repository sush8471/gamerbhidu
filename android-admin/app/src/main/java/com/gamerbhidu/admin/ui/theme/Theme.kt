package com.gamerbhidu.admin.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp


// ═════════════════════════════════════════════════════════════════════════════
// EPIC GAMES STORE THEME SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Extended color system for Epic Games aesthetic
 * Includes glassmorphism, glows, and gradient support
 */
data class EpicColors(
    // Core backgrounds
    val backgroundDeep: Color = BackgroundDeep,
    val background: Color = Background,
    val surface: Color = Surface,
    val surfaceVariant: Color = SurfaceVariant,
    val surfaceGlass: Color = SurfaceGlass,
    
    // Borders
    val borderSubtle: Color = BorderSubtle,
    val border: Color = Border,
    val borderLight: Color = BorderLight,
    val borderGlow: Color = BorderGlow,
    
    // Primary accents
    val primary: Color = Primary,
    val primaryBright: Color = PrimaryBright,
    val primarySoft: Color = PrimarySoft,
    val primaryGlow: Color = PrimaryGlow,
    
    // Secondary accents
    val secondary: Color = Secondary,
    val secondaryBright: Color = SecondaryBright,
    val secondaryGlow: Color = SecondaryGlow,
    val cyanAccent: Color = CyanAccent,
    val cyanGlow: Color = CyanGlow,
    
    // Text hierarchy
    val textPrimary: Color = TextPrimary,
    val textSecondary: Color = TextSecondary,
    val textTertiary: Color = TextTertiary,
    val textDisabled: Color = TextDisabled,
    
    // Status colors
    val success: Color = Success,
    val successGlow: Color = SuccessGlow,
    val successSubtle: Color = SuccessSubtle,
    val warning: Color = Warning,
    val warningGlow: Color = WarningGlow,
    val warningSubtle: Color = WarningSubtle,
    val error: Color = Error,
    val errorGlow: Color = ErrorGlow,
    val errorSubtle: Color = ErrorSubtle,
    val info: Color = Info,
    val infoSubtle: Color = InfoSubtle,
    
    // Game status
    val statusReleased: Color = StatusReleased,
    val statusUpcoming: Color = StatusUpcoming,
    val statusBeta: Color = StatusBeta,
    val statusHidden: Color = StatusHidden,
    val statusVisible: Color = StatusVisible,
    
    // Components
    val cardBackground: Color = CardBackground,
    val cardBackgroundHover: Color = CardBackgroundHover,
    val cardBorder: Color = CardBorder,
    val cardBorderGlow: Color = CardBorderGlow,
    val inputBackground: Color = InputBackground,
    val inputBorder: Color = InputBorder,
    val inputBorderFocus: Color = InputBorderFocus,
    val buttonSecondary: Color = ButtonSecondary,
    val buttonSecondaryHover: Color = ButtonSecondaryHover,
    
    // Effects
    val glowBlue: Color = GlowBlue,
    val glowPurple: Color = GlowPurple,
    val glowCyan: Color = GlowCyan,
    val shadowColor: Color = ShadowColor,
    val overlayScrim: Color = OverlayScrim,
    val overlayGradient: Color = OverlayGradient
)

// CompositionLocal for theme access
val LocalEpicColors = staticCompositionLocalOf { EpicColors() }

// ═════════════════════════════════════════════════════════════════════════════
// COLOR SCHEMES
// ═════════════════════════════════════════════════════════════════════════════

private val EpicDarkColorScheme = darkColorScheme(
    primary = Primary,
    onPrimary = TextOnPrimary,
    primaryContainer = SurfaceVariant,
    onPrimaryContainer = TextPrimary,
    
    secondary = Secondary,
    onSecondary = TextPrimary,
    secondaryContainer = SecondaryGlow,
    onSecondaryContainer = TextPrimary,
    
    tertiary = TextPrimary,
    onTertiary = Color.Black,
    tertiaryContainer = SurfaceVariant,
    onTertiaryContainer = TextPrimary,
    
    background = Background,
    onBackground = TextPrimary,
    
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = TextSecondary,
    
    surfaceTint = Color.Transparent,
    inverseSurface = TextPrimary,
    inverseOnSurface = Background,
    inversePrimary = Primary,
    
    outline = Border,
    outlineVariant = BorderSubtle,
    
    error = Error,
    onError = TextOnPrimary,
    errorContainer = ErrorSubtle,
    onErrorContainer = Error,
    
    scrim = OverlayScrim
)

// Light scheme (for future support, though Epic is dark-first)
private val EpicLightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = TextOnPrimary,
    primaryContainer = PrimarySoft,
    onPrimaryContainer = TextPrimary,
    // ... (define if needed)
)

// ═════════════════════════════════════════════════════════════════════════════
// THEME COMPOSABLE
// ═════════════════════════════════════════════════════════════════════════════

@Composable
fun GamerBhiduAdminTheme(
    darkTheme: Boolean = true, // Force dark for Epic aesthetic
    dynamicColor: Boolean = false, // Disable dynamic colors to maintain brand
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && darkTheme -> EpicDarkColorScheme // TODO: Add dynamic support
        darkTheme -> EpicDarkColorScheme
        else -> EpicDarkColorScheme // Always dark for Epic style
    }
    
    CompositionLocalProvider(
        LocalEpicColors provides EpicColors()
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = EpicTypography,
            shapes = EpicShapes,
            content = content
        )
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// SHAPE SYSTEM (Rounded, gaming aesthetic)
// ═════════════════════════════════════════════════════════════════════════════

val EpicShapes = Shapes(
    extraSmall = androidx.compose.foundation.shape.RoundedCornerShape(4.dp),
    small = androidx.compose.foundation.shape.RoundedCornerShape(8.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
    extraLarge = androidx.compose.foundation.shape.RoundedCornerShape(24.dp)
)

// ═════════════════════════════════════════════════════════════════════════════
// CONVENIENCE ACCESSORS
// ═════════════════════════════════════════════════════════════════════════════

object GamerBhiduAdminTheme {
    val colors: EpicColors
        @Composable
        get() = LocalEpicColors.current
    
    val typography: Typography
        @Composable
        get() = MaterialTheme.typography
    
    val shapes: Shapes
        @Composable
        get() = MaterialTheme.shapes
}

// Legacy support
val LocalGamerBhiduColors = LocalEpicColors