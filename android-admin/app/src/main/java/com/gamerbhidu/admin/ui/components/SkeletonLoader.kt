package com.gamerbhidu.admin.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.gamerbhidu.admin.ui.theme.GamerBhiduAdminTheme

/**
 * Reusable shimmer brush modifier for skeleton loading.
 * Sweeps a subtle highlight across the surface.
 */
fun Modifier.shimmerEffect(
    shape: Shape = RoundedCornerShape(8.dp),
    baseColor: Color? = null,
    highlightColor: Color? = null
): Modifier = composed {
    var size by remember { mutableStateOf(IntSize.Zero) }
    val transition = rememberInfiniteTransition(label = "shimmerTransition")

    val startOffsetX by transition.animateFloat(
        initialValue = -2 * size.width.toFloat().coerceAtLeast(400f),
        targetValue = 2 * size.width.toFloat().coerceAtLeast(400f),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1300, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerOffset"
    )

    val actualBase = baseColor ?: GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.8f)
    val actualHighlight = highlightColor ?: GamerBhiduAdminTheme.colors.borderLight.copy(alpha = 0.5f)

    this
        .onGloballyPositioned { size = it.size }
        .clip(shape)
        .background(
            brush = Brush.linearGradient(
                colors = listOf(
                    actualBase,
                    actualHighlight,
                    actualBase
                ),
                start = Offset(startOffsetX, 0f),
                end = Offset(
                    startOffsetX + size.width.toFloat().coerceAtLeast(300f),
                    size.height.toFloat().coerceAtLeast(100f)
                )
            ),
            shape = shape
        )
}

@Composable
fun SkeletonBox(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(8.dp)
) {
    Box(
        modifier = modifier.shimmerEffect(shape = shape)
    )
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD SKELETON
// ═════════════════════════════════════════════════════════════════════════════

@Composable
fun DashboardSkeleton(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // ── 2x2 Stats Grid Skeleton ──────────────────────────────────────────
        Column(
            modifier = Modifier.padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            for (row in 0..1) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    for (col in 0..1) {
                        StatCardSkeleton(modifier = Modifier.weight(1f))
                    }
                }
            }
        }

        // ── Recent Activity Header Skeleton ──────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                SkeletonBox(
                    modifier = Modifier
                        .width(120.dp)
                        .height(12.dp),
                    shape = RoundedCornerShape(4.dp)
                )
                SkeletonBox(
                    modifier = Modifier
                        .width(160.dp)
                        .height(18.dp),
                    shape = RoundedCornerShape(4.dp)
                )
            }
            SkeletonBox(
                modifier = Modifier
                    .width(84.dp)
                    .height(34.dp),
                shape = RoundedCornerShape(10.dp)
            )
        }

        // ── Recent Activity Items Skeleton ───────────────────────────────────
        Column(
            modifier = Modifier.padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            repeat(4) {
                ActivityItemSkeleton()
            }
        }
    }
}

@Composable
private fun StatCardSkeleton(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(GamerBhiduAdminTheme.colors.surface)
            .border(
                width = 1.dp,
                color = GamerBhiduAdminTheme.colors.border.copy(alpha = 0.4f),
                shape = RoundedCornerShape(20.dp)
            )
            .padding(18.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SkeletonBox(
                    modifier = Modifier.size(44.dp),
                    shape = RoundedCornerShape(14.dp)
                )
                SkeletonBox(
                    modifier = Modifier.size(28.dp),
                    shape = CircleShape
                )
            }
            SkeletonBox(
                modifier = Modifier
                    .width(70.dp)
                    .height(36.dp),
                shape = RoundedCornerShape(6.dp)
            )
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                SkeletonBox(
                    modifier = Modifier
                        .width(90.dp)
                        .height(14.dp),
                    shape = RoundedCornerShape(4.dp)
                )
                SkeletonBox(
                    modifier = Modifier
                        .width(110.dp)
                        .height(11.dp),
                    shape = RoundedCornerShape(4.dp)
                )
            }
        }
    }
}

@Composable
private fun ActivityItemSkeleton() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(GamerBhiduAdminTheme.colors.surface)
            .border(
                width = 1.dp,
                color = GamerBhiduAdminTheme.colors.border.copy(alpha = 0.4f),
                shape = RoundedCornerShape(16.dp)
            )
            .padding(14.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            SkeletonBox(
                modifier = Modifier.size(60.dp),
                shape = RoundedCornerShape(12.dp)
            )
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SkeletonBox(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(16.dp),
                    shape = RoundedCornerShape(4.dp)
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SkeletonBox(
                        modifier = Modifier
                            .width(50.dp)
                            .height(20.dp),
                        shape = RoundedCornerShape(6.dp)
                    )
                    SkeletonBox(
                        modifier = Modifier
                            .width(60.dp)
                            .height(20.dp),
                        shape = RoundedCornerShape(6.dp)
                    )
                }
            }
            SkeletonBox(
                modifier = Modifier
                    .width(36.dp)
                    .height(12.dp),
                shape = RoundedCornerShape(4.dp)
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// GAMES LIST SKELETON
// ═════════════════════════════════════════════════════════════════════════════

@Composable
fun GamesListSkeleton(
    modifier: Modifier = Modifier,
    count: Int = 5
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        repeat(count) {
            GameCardSkeleton()
        }
    }
}

@Composable
fun GameCardSkeleton(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(GamerBhiduAdminTheme.colors.surface)
            .border(
                width = 1.dp,
                color = GamerBhiduAdminTheme.colors.border.copy(alpha = 0.4f),
                shape = RoundedCornerShape(16.dp)
            )
            .padding(14.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            SkeletonBox(
                modifier = Modifier.size(width = 78.dp, height = 104.dp),
                shape = RoundedCornerShape(8.dp)
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .height(104.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SkeletonBox(
                        modifier = Modifier
                            .fillMaxWidth(0.85f)
                            .height(18.dp),
                        shape = RoundedCornerShape(4.dp)
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        SkeletonBox(
                            modifier = Modifier
                                .width(60.dp)
                                .height(20.dp),
                            shape = RoundedCornerShape(6.dp)
                        )
                        SkeletonBox(
                            modifier = Modifier
                                .width(50.dp)
                                .height(20.dp),
                            shape = RoundedCornerShape(6.dp)
                        )
                    }
                }
                SkeletonBox(
                    modifier = Modifier
                        .width(70.dp)
                        .height(18.dp),
                    shape = RoundedCornerShape(4.dp)
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                SkeletonBox(
                    modifier = Modifier.size(34.dp),
                    shape = CircleShape
                )
                SkeletonBox(
                    modifier = Modifier.size(34.dp),
                    shape = CircleShape
                )
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// SOCIAL PROOFS SKELETON
// ═════════════════════════════════════════════════════════════════════════════

@Composable
fun SocialProofsSkeleton(
    modifier: Modifier = Modifier,
    count: Int = 5
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        repeat(count) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(GamerBhiduAdminTheme.colors.surface)
                    .border(
                        width = 1.dp,
                        color = GamerBhiduAdminTheme.colors.border,
                        shape = RoundedCornerShape(14.dp)
                    )
                    .padding(12.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    SkeletonBox(
                        modifier = Modifier.size(width = 80.dp, height = 48.dp),
                        shape = RoundedCornerShape(8.dp)
                    )
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        SkeletonBox(
                            modifier = Modifier
                                .fillMaxWidth(0.6f)
                                .height(16.dp),
                            shape = RoundedCornerShape(4.dp)
                        )
                        SkeletonBox(
                            modifier = Modifier
                                .width(70.dp)
                                .height(12.dp),
                            shape = RoundedCornerShape(4.dp)
                        )
                    }
                    SkeletonBox(
                        modifier = Modifier.size(36.dp),
                        shape = CircleShape
                    )
                }
            }
        }
    }
}
