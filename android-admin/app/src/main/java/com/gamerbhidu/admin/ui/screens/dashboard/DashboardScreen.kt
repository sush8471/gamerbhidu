package com.gamerbhidu.admin.ui.screens.dashboard

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamerbhidu.admin.R
import com.gamerbhidu.admin.data.model.DashboardStats
import com.gamerbhidu.admin.ui.components.FrostedStatusBarOverlay
import com.gamerbhidu.admin.ui.theme.*
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.haze

// ═════════════════════════════════════════════════════════════════════════════
// GAMER BHIDU DASHBOARD — REDESIGNED COMMAND CENTER (v2)
// Modern mobile-first layout: Avatar header → Stats scroll → Quick Add → List nav
// ═════════════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onOpenMenu: () -> Unit = {},
    onNavigateToGames: () -> Unit = {},
    onNavigateToAddGame: () -> Unit = {},
    onNavigateToOrders: () -> Unit = {},
    onNavigateToProofs: () -> Unit = {},
    onNavigateToSections: () -> Unit = {},
    onNavigateToCombos: () -> Unit = {},
    onLogout: () -> Unit = {},
    viewModel: DashboardViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val hazeState = remember { HazeState() }
    val listState = rememberLazyListState()
    val isScrolled by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 || listState.firstVisibleItemScrollOffset > 10 }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(GamerBhiduAdminTheme.colors.backgroundDeep)
    ) {
        // Subtle ambient atmospheric glow — top left
        Box(
            modifier = Modifier
                .size(320.dp)
                .offset(x = (-80).dp, y = (-60).dp)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.07f),
                            Color.Transparent
                        )
                    ),
                    shape = CircleShape
                )
                .blur(80.dp)
        )
        // Secondary ambient — bottom right
        Box(
            modifier = Modifier
                .size(240.dp)
                .align(Alignment.BottomEnd)
                .offset(x = 60.dp, y = 60.dp)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            GamerBhiduAdminTheme.colors.success.copy(alpha = 0.05f),
                            Color.Transparent
                        )
                    ),
                    shape = CircleShape
                )
                .blur(80.dp)
        )

        PullToRefreshBox(
            isRefreshing = uiState.isRefreshing,
            onRefresh = { viewModel.refresh() },
            modifier = Modifier.fillMaxSize()
        ) {
            when {
                uiState.isLoading -> {
                    DashboardSkeletonV2()
                }

                uiState.error != null -> {
                    DashboardErrorState(
                        message = uiState.error ?: "Failed to load dashboard data.",
                        onRetry = { viewModel.loadData() }
                    )
                }

                else -> {
                    DashboardContent(
                        uiState = uiState,
                        hazeState = hazeState,
                        onOpenMenu = onOpenMenu,
                        onNavigateToGames = onNavigateToGames,
                        onNavigateToAddGame = onNavigateToAddGame,
                        onNavigateToOrders = onNavigateToOrders,
                        onNavigateToProofs = onNavigateToProofs,
                        onNavigateToSections = onNavigateToSections,
                        onNavigateToCombos = onNavigateToCombos,
                        onLogout = onLogout,
                        onRefresh = { viewModel.refresh() },
                        listState = listState,
                        viewModel = viewModel
                    )
                }
            }
        }

        FrostedStatusBarOverlay(hazeState = hazeState, isScrolled = isScrolled)
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD CONTENT
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun DashboardContent(
    uiState: DashboardUiState,
    hazeState: HazeState,
    onOpenMenu: () -> Unit,
    onNavigateToGames: () -> Unit,
    onNavigateToAddGame: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToProofs: () -> Unit,
    onNavigateToSections: () -> Unit,
    onNavigateToCombos: () -> Unit,
    onLogout: () -> Unit,
    onRefresh: () -> Unit,
    listState: androidx.compose.foundation.lazy.LazyListState,
    viewModel: DashboardViewModel
) {
    LazyColumn(
        state = listState,
        modifier = Modifier
            .fillMaxSize()
            .haze(hazeState),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // ── 1. Header ─────────────────────────────────────────────────────────
        item(key = "top_bar") {
            DashboardTopBar(
                adminEmail = uiState.adminEmail,
                onRefresh = onRefresh,
                onLogout = onLogout,
                viewModel = viewModel
            )
        }

        // ── 2. Stats Overview (horizontal scroll) ─────────────────────────────
        item(key = "stats_row") {
            StatsOverviewSection(stats = uiState.stats)
        }

        // ── 3. Quick Add CTA ──────────────────────────────────────────────────
        item(key = "quick_add_cta") {
            QuickAddSection(onNavigateToAddGame = onNavigateToAddGame)
        }

        // ── 4. Quick Access Navigation List ───────────────────────────────────
        item(key = "quick_access_list") {
            QuickAccessSection(
                stats = uiState.stats,
                onNavigateToGames = onNavigateToGames,
                onNavigateToProofs = onNavigateToProofs,
                onNavigateToSections = onNavigateToSections,
                onNavigateToCombos = onNavigateToCombos,
                onNavigateToOrders = onNavigateToOrders
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// HEADER — AVATAR + BRAND + ACTIONS
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun DashboardTopBar(
    adminEmail: String,
    onRefresh: () -> Unit,
    onLogout: () -> Unit,
    viewModel: DashboardViewModel
) {
    var showLogoutDialog by remember { mutableStateOf(false) }

    // Derive initials from email
    val initials = remember(adminEmail) {
        adminEmail.substringBefore("@").take(2).uppercase().ifEmpty { "AD" }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text(
                    "Sign Out",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = GamerBhiduAdminTheme.colors.textPrimary
                    )
                )
            },
            text = {
                Text(
                    "Are you sure you want to sign out of the Gamer Bhidu Admin Console?",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = GamerBhiduAdminTheme.colors.textSecondary
                    )
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.signOut(onLogout)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GamerBhiduAdminTheme.colors.error
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Sign Out", fontWeight = FontWeight.SemiBold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = GamerBhiduAdminTheme.colors.textSecondary)
                }
            },
            containerColor = GamerBhiduAdminTheme.colors.surface,
            shape = RoundedCornerShape(20.dp)
        )
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // Left: Admin Avatar + Brand Identity
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Admin avatar with online indicator
            Box {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    Color(0xFF27272A),
                                    Color(0xFF18181B)
                                )
                            )
                        )
                        .border(1.dp, GamerBhiduAdminTheme.colors.borderSubtle, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initials,
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 13.sp,
                            letterSpacing = 0.sp
                        )
                    )
                }
                // Online status indicator
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .align(Alignment.BottomEnd)
                        .clip(CircleShape)
                        .background(GamerBhiduAdminTheme.colors.backgroundDeep)
                        .padding(1.5.dp)
                        .clip(CircleShape)
                        .background(GamerBhiduAdminTheme.colors.success)
                )
            }

            // Brand name + status
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Image(
                        painter = painterResource(R.drawable.gamerbhidu_emblem),
                        contentDescription = "Gamer Bhidu",
                        modifier = Modifier.size(18.dp),
                        contentScale = ContentScale.Fit
                    )
                    Text(
                        text = "Gamer Bhidu",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = (-0.3).sp,
                            color = GamerBhiduAdminTheme.colors.textPrimary,
                            fontSize = 15.sp
                        )
                    )
                }
                Text(
                    text = "Admin Console",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = GamerBhiduAdminTheme.colors.textTertiary,
                        fontSize = 11.sp,
                        letterSpacing = 0.2.sp
                    )
                )
            }
        }

        // Right: Action Buttons
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Refresh
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f))
                    .border(
                        1.dp,
                        GamerBhiduAdminTheme.colors.borderSubtle,
                        RoundedCornerShape(10.dp)
                    )
                    .clickable(onClick = onRefresh),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Outlined.Sync,
                    contentDescription = "Refresh data",
                    tint = GamerBhiduAdminTheme.colors.textSecondary,
                    modifier = Modifier.size(17.dp)
                )
            }

            // Logout
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(GamerBhiduAdminTheme.colors.error.copy(alpha = 0.08f))
                    .border(
                        1.dp,
                        GamerBhiduAdminTheme.colors.error.copy(alpha = 0.2f),
                        RoundedCornerShape(10.dp)
                    )
                    .clickable { showLogoutDialog = true },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.Logout,
                    contentDescription = "Sign Out",
                    tint = GamerBhiduAdminTheme.colors.error,
                    modifier = Modifier.size(17.dp)
                )
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// STATS OVERVIEW — HORIZONTAL SCROLLABLE CARDS
// ═════════════════════════════════════════════════════════════════════════════

private data class StatCardData(
    val label: String,
    val value: String,
    val icon: ImageVector,
    val accentColor: Color,
    val trend: String? = null,
    val trendUp: Boolean = true
)

@Composable
private fun StatsOverviewSection(stats: DashboardStats) {
    val cards = remember(stats) {
        listOf(
            StatCardData(
                label = "Active Games",
                value = stats.visible.toString(),
                icon = Icons.Outlined.Visibility,
                accentColor = Success,
                trend = null
            ),
            StatCardData(
                label = "Hidden / Drafts",
                value = stats.hidden.toString(),
                icon = Icons.Outlined.VisibilityOff,
                accentColor = Warning,
                trend = null
            ),
            StatCardData(
                label = "Social Proofs",
                value = stats.socialProofs.toString(),
                icon = Icons.Outlined.Verified,
                accentColor = Color(0xFFE4E4E7),
                trend = null
            ),
            StatCardData(
                label = "Total Titles",
                value = stats.total.toString(),
                icon = Icons.Outlined.SportsEsports,
                accentColor = Color(0xFFA1A1AA),
                trend = null
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp, bottom = 8.dp)
    ) {
        // Section header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Storefront Overview",
                style = MaterialTheme.typography.titleSmall.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontSize = 13.sp,
                    letterSpacing = (-0.1).sp
                )
            )
            Text(
                text = "${stats.total} Total",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = GamerBhiduAdminTheme.colors.textTertiary,
                    fontSize = 11.sp
                )
            )
        }

        Spacer(Modifier.height(10.dp))

        // Horizontally scrollable stat cards
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(horizontal = 16.dp)
        ) {
            items(cards, key = { it.label }) { card ->
                StatCard(card = card)
            }
        }
    }
}

@Composable
private fun StatCard(card: StatCardData) {
    Box(
        modifier = Modifier
            .width(112.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(GamerBhiduAdminTheme.colors.surface)
            .border(
                width = 1.dp,
                color = GamerBhiduAdminTheme.colors.borderSubtle,
                shape = RoundedCornerShape(16.dp)
            )
    ) {
        // Left accent bar
        Box(
            modifier = Modifier
                .width(3.dp)
                .height(56.dp)
                .align(Alignment.CenterStart)
                .clip(RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp, topEnd = 3.dp, bottomEnd = 3.dp))
                .background(card.accentColor)
        )

        Column(
            modifier = Modifier.padding(start = 12.dp, end = 10.dp, top = 12.dp, bottom = 12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(card.accentColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = card.icon,
                    contentDescription = null,
                    tint = card.accentColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Value
            Text(
                text = card.value,
                style = MaterialTheme.typography.displaySmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontSize = 26.sp,
                    letterSpacing = (-0.5).sp,
                    lineHeight = 28.sp
                )
            )

            // Label
            Text(
                text = card.label,
                style = MaterialTheme.typography.labelSmall.copy(
                    color = GamerBhiduAdminTheme.colors.textTertiary,
                    fontSize = 10.sp,
                    lineHeight = 13.sp,
                    letterSpacing = 0.2.sp
                ),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// QUICK ADD — COMPACT PRIMARY CTA BUTTON
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun QuickAddSection(onNavigateToAddGame: () -> Unit) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1f,
        animationSpec = tween(durationMillis = 150, easing = FastOutSlowInEasing),
        label = "add_cta_scale"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
    ) {
        Text(
            text = "Quick Operations",
            style = MaterialTheme.typography.titleSmall.copy(
                fontWeight = FontWeight.SemiBold,
                color = GamerBhiduAdminTheme.colors.textPrimary,
                fontSize = 13.sp,
                letterSpacing = (-0.1).sp
            )
        )

        Spacer(Modifier.height(10.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .scale(scale)
                .clip(RoundedCornerShape(14.dp))
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF18181B),
                            Color(0xFF111111)
                        )
                    )
                )
                .border(
                    width = 1.dp,
                    color = Color.White.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(14.dp)
                )
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = onNavigateToAddGame
                )
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Filled.AddCircle,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = "Add Game via Steam",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        )
                        Text(
                            text = "Auto-fetch poster, pricing & metadata",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = GamerBhiduAdminTheme.colors.textSecondary,
                                fontSize = 11.sp
                            )
                        )
                    }
                }

                // Instant fetch chip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .padding(horizontal = 9.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "⚡ FETCH",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.sp,
                            letterSpacing = 0.8.sp
                        )
                    )
                }
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// QUICK ACCESS NAVIGATION LIST
// ═════════════════════════════════════════════════════════════════════════════

private data class QuickAccessItem(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val accentColor: Color,
    val badge: String? = null,
    val onClick: () -> Unit
)

@Composable
private fun QuickAccessSection(
    stats: DashboardStats,
    onNavigateToGames: () -> Unit,
    onNavigateToProofs: () -> Unit,
    onNavigateToSections: () -> Unit,
    onNavigateToCombos: () -> Unit,
    onNavigateToOrders: () -> Unit
) {
    val items = remember(stats) {
        listOf(
            QuickAccessItem(
                title = "Games Catalog",
                description = "Browse & edit prices, tags, visibility",
                icon = Icons.Outlined.SportsEsports,
                accentColor = Color(0xFFE4E4E7),
                badge = "${stats.total}",
                onClick = onNavigateToGames
            ),
            QuickAccessItem(
                title = "Social Proofs",
                description = "Reviews, delivery shots & testimonials",
                icon = Icons.Outlined.RateReview,
                accentColor = Success,
                badge = "${stats.socialProofs}",
                onClick = onNavigateToProofs
            ),
            QuickAccessItem(
                title = "Store Sections",
                description = "Featured shelves & carousel carousels",
                icon = Icons.Outlined.DashboardCustomize,
                accentColor = Warning,
                badge = null,
                onClick = onNavigateToSections
            ),
            QuickAccessItem(
                title = "Combo Deals",
                description = "Bundled discounts & promotions",
                icon = Icons.Outlined.LocalOffer,
                accentColor = Color(0xFFF43F5E),
                badge = null,
                onClick = onNavigateToCombos
            ),
            QuickAccessItem(
                title = "Orders & Ledger",
                description = "Payment logs & customer history",
                icon = Icons.AutoMirrored.Outlined.ReceiptLong,
                accentColor = Color(0xFFA1A1AA),
                badge = null,
                onClick = onNavigateToOrders
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = "Quick Access",
            style = MaterialTheme.typography.titleSmall.copy(
                fontWeight = FontWeight.SemiBold,
                color = GamerBhiduAdminTheme.colors.textPrimary,
                fontSize = 13.sp,
                letterSpacing = (-0.1).sp
            )
        )

        Spacer(Modifier.height(10.dp))

        // Card container for all list items
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(GamerBhiduAdminTheme.colors.surface)
                .border(
                    width = 1.dp,
                    color = GamerBhiduAdminTheme.colors.borderSubtle,
                    shape = RoundedCornerShape(16.dp)
                )
        ) {
            items.forEachIndexed { index, item ->
                QuickAccessListItem(item = item)

                // Divider between items (not after last)
                if (index < items.lastIndex) {
                    HorizontalDivider(
                        modifier = Modifier.padding(start = 64.dp),
                        color = GamerBhiduAdminTheme.colors.borderSubtle,
                        thickness = 0.5.dp
                    )
                }
            }
        }
    }
}

@Composable
private fun QuickAccessListItem(item: QuickAccessItem) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.99f else 1f,
        animationSpec = tween(durationMillis = 150, easing = FastOutSlowInEasing),
        label = "list_item_scale_${item.title}"
    )
    val bgAlpha by animateFloatAsState(
        targetValue = if (isPressed) 1f else 0f,
        animationSpec = tween(durationMillis = 150),
        label = "list_item_bg_${item.title}"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .scale(scale)
            .background(
                GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = bgAlpha * 0.3f)
            )
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = item.onClick
            )
            .padding(horizontal = 14.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Icon container
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(item.accentColor.copy(alpha = 0.12f))
                .border(
                    1.dp,
                    item.accentColor.copy(alpha = 0.2f),
                    RoundedCornerShape(11.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = item.accentColor,
                modifier = Modifier.size(20.dp)
            )
        }

        // Title + Description
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = GamerBhiduAdminTheme.colors.textPrimary,
                        fontSize = 14.sp,
                        letterSpacing = (-0.1).sp
                    )
                )
                // Badge count (if applicable)
                if (item.badge != null) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(item.accentColor.copy(alpha = 0.12f))
                            .padding(horizontal = 7.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = item.badge,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = item.accentColor,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                letterSpacing = 0.sp
                            )
                        )
                    }
                }
            }
            Text(
                text = item.description,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = GamerBhiduAdminTheme.colors.textTertiary,
                    fontSize = 11.sp,
                    lineHeight = 14.sp
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        // Chevron
        Icon(
            Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = GamerBhiduAdminTheme.colors.textTertiary,
            modifier = Modifier.size(16.dp)
        )
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// SKELETON LOADER V2 — MATCHES NEW LAYOUT
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun DashboardSkeletonV2() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding(),
        verticalArrangement = Arrangement.spacedBy(0.dp)
    ) {
        // ── Header skeleton ──────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SkeletonShimmer(
                    modifier = Modifier.size(40.dp),
                    shape = CircleShape
                )
                Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    SkeletonShimmer(modifier = Modifier.width(100.dp).height(13.dp), shape = RoundedCornerShape(4.dp))
                    SkeletonShimmer(modifier = Modifier.width(68.dp).height(10.dp), shape = RoundedCornerShape(4.dp))
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SkeletonShimmer(modifier = Modifier.size(38.dp), shape = RoundedCornerShape(10.dp))
                SkeletonShimmer(modifier = Modifier.size(38.dp), shape = RoundedCornerShape(10.dp))
            }
        }

        Spacer(Modifier.height(12.dp))

        // ── Stats row skeleton ───────────────────────────────────────────────
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                SkeletonShimmer(modifier = Modifier.width(110.dp).height(12.dp), shape = RoundedCornerShape(4.dp))
                SkeletonShimmer(modifier = Modifier.width(50.dp).height(12.dp), shape = RoundedCornerShape(4.dp))
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                repeat(4) {
                    SkeletonShimmer(
                        modifier = Modifier.width(112.dp).height(100.dp),
                        shape = RoundedCornerShape(16.dp)
                    )
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        // ── Quick Operations skeleton ─────────────────────────────────────────
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            SkeletonShimmer(modifier = Modifier.width(110.dp).height(12.dp), shape = RoundedCornerShape(4.dp))
            Spacer(Modifier.height(10.dp))
            SkeletonShimmer(
                modifier = Modifier.fillMaxWidth().height(64.dp),
                shape = RoundedCornerShape(14.dp)
            )
        }

        Spacer(Modifier.height(20.dp))

        // ── Quick Access list skeleton ────────────────────────────────────────
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            SkeletonShimmer(modifier = Modifier.width(80.dp).height(12.dp), shape = RoundedCornerShape(4.dp))
            Spacer(Modifier.height(10.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(GamerBhiduAdminTheme.colors.surface)
                    .border(1.dp, GamerBhiduAdminTheme.colors.borderSubtle, RoundedCornerShape(16.dp))
            ) {
                repeat(5) { index ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 13.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        SkeletonShimmer(modifier = Modifier.size(40.dp), shape = RoundedCornerShape(11.dp))
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                            SkeletonShimmer(modifier = Modifier.width(100.dp).height(13.dp), shape = RoundedCornerShape(4.dp))
                            SkeletonShimmer(modifier = Modifier.width(150.dp).height(10.dp), shape = RoundedCornerShape(4.dp))
                        }
                        SkeletonShimmer(modifier = Modifier.size(16.dp), shape = RoundedCornerShape(4.dp))
                    }
                    if (index < 4) {
                        HorizontalDivider(
                            modifier = Modifier.padding(start = 64.dp),
                            color = GamerBhiduAdminTheme.colors.borderSubtle,
                            thickness = 0.5.dp
                        )
                    }
                }
            }
        }
    }
}

/** Inline shimmer placeholder used by DashboardSkeletonV2 */
@Composable
private fun SkeletonShimmer(
    modifier: Modifier = Modifier,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(8.dp)
) {
    val transition = rememberInfiniteTransition(label = "skeletonShimmer")
    val shimmerAlpha by transition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.7f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "shimmerAlpha"
    )

    Box(
        modifier = modifier
            .clip(shape)
            .background(
                GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = shimmerAlpha)
            )
    )
}

// ═════════════════════════════════════════════════════════════════════════════
// ERROR STATE
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun DashboardErrorState(
    message: String,
    onRetry: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(GamerBhiduAdminTheme.colors.error.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.ErrorOutline,
                    contentDescription = null,
                    tint = GamerBhiduAdminTheme.colors.error,
                    modifier = Modifier.size(36.dp)
                )
            }

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Something went wrong",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = GamerBhiduAdminTheme.colors.textPrimary
                    )
                )
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = GamerBhiduAdminTheme.colors.textSecondary
                    ),
                    textAlign = TextAlign.Center
                )
            }

            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(
                    containerColor = GamerBhiduAdminTheme.colors.primary,
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(12.dp),
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp)
            ) {
                Icon(
                    Icons.Default.Refresh,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text("Retry", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
