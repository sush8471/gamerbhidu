package com.gamerbhidu.admin.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex

import com.gamerbhidu.admin.ui.theme.*
import dev.chrisbanes.haze.HazeDefaults
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.hazeChild

/**
 * Epic Games Store-style frosted glass status bar overlay.
 * Features gradient fade, subtle border glow, and smooth 120Hz-ready transitions.
 */
@Composable
fun FrostedStatusBarOverlay(
    hazeState: HazeState,
    scrollProgress: Float,
    modifier: Modifier = Modifier,
    extraHeight: Dp = 12.dp,
    blurRadius: Dp = 30.dp,
    showBorder: Boolean = true
) {
    val statusBarHeight = WindowInsets.statusBars.asPaddingValues().calculateTopPadding()
    val totalHeight = statusBarHeight + extraHeight

    val overlayAlpha by animateFloatAsState(
        targetValue = scrollProgress.coerceIn(0f, 1f),
        animationSpec = tween(
            durationMillis = 200,
            easing = FastOutSlowInEasing
        ),
        label = "statusBarBlurAlpha"
    )

    val borderAlpha by animateFloatAsState(
        targetValue = if (scrollProgress > 0.5f) 1f else 0f,
        animationSpec = tween(durationMillis = 300),
        label = "borderAlpha"
    )

    if (overlayAlpha > 0.005f) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .height(totalHeight)
                .zIndex(100f)
                .alpha(overlayAlpha)
                .hazeChild(
                    state = hazeState,
                    style = HazeDefaults.style(
                        backgroundColor = GamerBhiduAdminTheme.colors.background.copy(alpha = 0.75f),
                        blurRadius = blurRadius,
                        noiseFactor = 0.03f
                    )
                )
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            GamerBhiduAdminTheme.colors.background.copy(alpha = 0.85f),
                            GamerBhiduAdminTheme.colors.background.copy(alpha = 0.60f),
                            GamerBhiduAdminTheme.colors.background.copy(alpha = 0.30f),
                            Color.Transparent
                        )
                    )
                )
        ) {
            // Epic-style gradient border at bottom
            if (showBorder && borderAlpha > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .align(Alignment.BottomCenter)
                        .alpha(borderAlpha)
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    GamerBhiduAdminTheme.colors.borderLight,
                                    Color.Transparent
                                )
                            )
                        )
                )
            }
        }
    }
}

/**
 * Convenience overload with boolean flag.
 */
@Composable
fun FrostedStatusBarOverlay(
    hazeState: HazeState,
    isScrolled: Boolean,
    modifier: Modifier = Modifier,
    extraHeight: Dp = 12.dp,
    blurRadius: Dp = 30.dp
) {
    FrostedStatusBarOverlay(
        hazeState = hazeState,
        scrollProgress = if (isScrolled) 1f else 0f,
        modifier = modifier,
        extraHeight = extraHeight,
        blurRadius = blurRadius
    )
}

/**
 * Epic Games-style glass card container with backdrop blur.
 */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    hazeState: HazeState? = null,
    cornerRadius: Dp = 16.dp,
    glowColor: Color? = null,
    content: @Composable BoxScope.() -> Unit
) {
    val glow = glowColor ?: GamerBhiduAdminTheme.colors.primaryGlow
    
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(cornerRadius))
            .then(
                if (hazeState != null) {
                    Modifier.hazeChild(
                        state = hazeState,
                        style = HazeDefaults.style(
                            backgroundColor = GamerBhiduAdminTheme.colors.surfaceGlass,
                            blurRadius = 20.dp,
                            noiseFactor = 0.02f
                        )
                    )
                } else {
                    Modifier.background(GamerBhiduAdminTheme.colors.surfaceGlass)
                }
            )
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.08f),
                        Color.White.copy(alpha = 0.02f)
                    )
                )
            )
            .border(
                width = 1.dp,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.15f),
                        glow.copy(alpha = 0.3f),
                        Color.White.copy(alpha = 0.05f)
                    )
                ),
                shape = RoundedCornerShape(cornerRadius)
            ),
        content = content
    )
}

/**
 * Neon glow effect for buttons and interactive elements.
 */
@Composable
fun Modifier.neonGlow(
    color: Color = GamerBhiduAdminTheme.colors.primary,
    radius: Dp = 4.dp,
    alpha: Float = 0.25f
): Modifier = this.then(
    Modifier.shadow(
        elevation = radius,
        shape = RoundedCornerShape(12.dp),
        clip = false,
        ambientColor = color.copy(alpha = alpha),
        spotColor = color.copy(alpha = alpha)
    )
)