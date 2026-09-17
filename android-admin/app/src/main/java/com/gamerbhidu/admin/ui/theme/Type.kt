package com.gamerbhidu.admin.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Epic Games Store typography style
 * Clean, geometric, with strong weight hierarchy
 * For production: Add Inter font files to res/font/
 */
val EpicFontFamily = FontFamily.Default  // Replace with Inter when available

// Optional: Custom font setup
// val EpicFontFamily = FontFamily(
//     Font(R.font.inter_regular, FontWeight.Normal),
//     Font(R.font.inter_medium, FontWeight.Medium),
//     Font(R.font.inter_semibold, FontWeight.SemiBold),
//     Font(R.font.inter_bold, FontWeight.Bold),
//     Font(R.font.inter_extrabold, FontWeight.ExtraBold),
//     Font(R.font.inter_black, FontWeight.Black)
// )

val EpicTypography = Typography(
    // ═══ Display Styles (Hero sections, page titles) ═══
    displayLarge = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Black,
        fontSize = 32.sp,
        lineHeight = 40.sp,
        letterSpacing = (-1).sp,
        color = TextPrimary
    ),
    displayMedium = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = (-0.5).sp,
        color = TextPrimary
    ),
    displaySmall = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        letterSpacing = (-0.25).sp,
        color = TextPrimary
    ),

    // ═══ Headline Styles (Section headers) ═══
    headlineLarge = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = (-0.25).sp,
        color = TextPrimary
    ),
    headlineMedium = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.sp,
        color = TextPrimary
    ),
    headlineSmall = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
        letterSpacing = 0.sp,
        color = TextPrimary
    ),

    // ═══ Title Styles (Card titles, list items) ═══
    titleLarge = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
        letterSpacing = 0.15.sp,
        color = TextPrimary
    ),
    titleMedium = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp,
        color = TextPrimary
    ),
    titleSmall = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp,
        color = TextSecondary
    ),

    // ═══ Body Styles (Content, descriptions) ═══
    bodyLarge = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        lineHeight = 22.sp,
        letterSpacing = 0.25.sp,
        color = TextPrimary
    ),
    bodyMedium = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.25.sp,
        color = TextSecondary
    ),
    bodySmall = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp,
        color = TextTertiary
    ),

    // ═══ Label Styles (Buttons, chips, badges) ═══
    labelLarge = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.5.sp,  // Uppercase feel
        color = TextPrimary
    ),
    labelMedium = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp,
        color = TextSecondary
    ),
    labelSmall = TextStyle(
        fontFamily = EpicFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        lineHeight = 14.sp,
        letterSpacing = 1.sp,  // Wide tracking for small caps
        color = TextTertiary
    )
)

// Legacy alias for backward compatibility
val GamerBhiduTypography = EpicTypography
val GamerBhiduFontFamily = EpicFontFamily