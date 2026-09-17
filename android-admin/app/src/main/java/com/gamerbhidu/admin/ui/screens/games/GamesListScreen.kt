package com.gamerbhidu.admin.ui.screens.games

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.graphics.graphicsLayer
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import kotlinx.coroutines.flow.distinctUntilChanged
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.ui.components.GameCardSkeleton
import com.gamerbhidu.admin.ui.components.GamesListSkeleton
import com.gamerbhidu.admin.ui.theme.*
import com.gamerbhidu.admin.util.resolveImageUrl

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesListScreen(
    onNavigateBack: () -> Unit,
    onAddGame: () -> Unit,
    onEditGame: (String) -> Unit,
    viewModel: GamesListViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // Epic Delete Dialog
    uiState.deleteConfirmGame?.let { game ->
        AlertDialog(
            onDismissRequest = viewModel::cancelDelete,
            title = {
                Text(
                    "Delete Game?",
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    "\"${game.title}\" will be permanently deleted from the catalog and your website. This cannot be undone.",
                    color = GamerBhiduAdminTheme.colors.textSecondary,
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(onClick = viewModel::confirmDelete) {
                    Text(
                        "Delete",
                        color = GamerBhiduAdminTheme.colors.error,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = viewModel::cancelDelete) {
                    Text("Cancel", color = GamerBhiduAdminTheme.colors.textSecondary)
                }
            },
            containerColor = GamerBhiduAdminTheme.colors.surface,
            shape = RoundedCornerShape(20.dp)
        )
    }

    val listState = rememberLazyListState()
    var isHeaderVisible by remember { mutableStateOf(true) }
    val isSearchActive = uiState.searchQuery.isNotEmpty()
    val isAtTop by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex == 0 && listState.firstVisibleItemScrollOffset <= 10
        }
    }

    LaunchedEffect(isAtTop, isSearchActive) {
        if (isAtTop || isSearchActive) {
            isHeaderVisible = true
        }
    }

    val nestedScrollConnection = remember(isSearchActive) {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                if (isSearchActive) return Offset.Zero
                val delta = available.y
                if (delta < -12f && !isAtTop) {
                    isHeaderVisible = false
                } else if (delta > 12f) {
                    isHeaderVisible = true
                }
                return Offset.Zero
            }
        }
    }

    LaunchedEffect(listState) {
        snapshotFlow {
            val total = listState.layoutInfo.totalItemsCount
            val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= total - 5 && total > 0
        }
            .distinctUntilChanged()
            .collect { shouldLoad ->
                if (shouldLoad) {
                    viewModel.loadNextPage()
                }
            }
    }

    var filterOpen by remember { mutableStateOf(false) }

    val activeFilters = buildList {
        if (uiState.selectedVisibility != "all") add(uiState.selectedVisibility)
        if (uiState.selectedStatus != "all") add(uiState.selectedStatus)
    }.size

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        GamerBhiduAdminTheme.colors.backgroundDeep,
                        GamerBhiduAdminTheme.colors.background
                    )
                )
            )
    ) {
        Scaffold(
            floatingActionButton = {
                FloatingActionButton(
                    onClick = onAddGame,
                    containerColor = GamerBhiduAdminTheme.colors.primary,
                    contentColor = Color.Black,
                    shape = RoundedCornerShape(16.dp),
                    elevation = FloatingActionButtonDefaults.elevation(
                        defaultElevation = 8.dp,
                        pressedElevation = 12.dp
                    ),
                    modifier = Modifier.shadow(
                        elevation = 12.dp,
                        shape = RoundedCornerShape(16.dp),
                        ambientColor = GamerBhiduAdminTheme.colors.glowBlue,
                        spotColor = GamerBhiduAdminTheme.colors.glowBlue
                    )
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Game", modifier = Modifier.size(28.dp))
                }
            },
            containerColor = Color.Transparent,
            contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { paddingValues ->
            val headerHeight = 56.dp
            val headerHeightPx = with(LocalDensity.current) { headerHeight.toPx() }
            val headerOffset by animateFloatAsState(
                targetValue = if (isHeaderVisible) 0f else -headerHeightPx,
                animationSpec = tween(durationMillis = 180, easing = FastOutSlowInEasing),
                label = "headerOffset"
            )

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .statusBarsPadding()
            ) {
                // ── Content Area (0 relayout overhead during collapse/expand) ─────
                when {
                    uiState.isLoading -> {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(top = headerHeight)
                        ) {
                            GamesListSkeleton()
                        }
                    }

                    uiState.games.isEmpty() -> {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(top = headerHeight),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(80.dp)
                                        .background(
                                            color = GamerBhiduAdminTheme.colors.surfaceVariant,
                                            shape = CircleShape
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.SearchOff,
                                        null,
                                        tint = GamerBhiduAdminTheme.colors.textTertiary,
                                        modifier = Modifier.size(36.dp)
                                    )
                                }
                                Text(
                                    "No games found",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        color = GamerBhiduAdminTheme.colors.textSecondary,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    "Try adjusting your filters",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = GamerBhiduAdminTheme.colors.textTertiary
                                    )
                                )
                            }
                        }
                    }

                    else -> {
                        LazyColumn(
                            state = listState,
                            modifier = Modifier
                                .fillMaxSize()
                                .nestedScroll(nestedScrollConnection),
                            contentPadding = PaddingValues(
                                start = 16.dp,
                                end = 16.dp,
                                top = headerHeight + 10.dp,
                                bottom = 100.dp
                            ),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Error banner
                            uiState.error?.let { error ->
                                item(key = "error_banner") {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(
                                                color = GamerBhiduAdminTheme.colors.errorSubtle,
                                                shape = RoundedCornerShape(12.dp)
                                            )
                                            .border(
                                                width = 1.dp,
                                                color = GamerBhiduAdminTheme.colors.error.copy(alpha = 0.4f),
                                                shape = RoundedCornerShape(12.dp)
                                            )
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Warning,
                                            null,
                                            tint = GamerBhiduAdminTheme.colors.error,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            error,
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = GamerBhiduAdminTheme.colors.error
                                            ),
                                            modifier = Modifier.weight(1f)
                                        )
                                        IconButton(
                                            onClick = viewModel::clearError,
                                            modifier = Modifier.size(20.dp)
                                        ) {
                                            Icon(
                                                Icons.Default.Close,
                                                contentDescription = "Dismiss",
                                                tint = GamerBhiduAdminTheme.colors.textTertiary,
                                                modifier = Modifier.size(14.dp)
                                            )
                                        }
                                    }
                                }
                            }

                            items(
                                items = uiState.games,
                                key = { it.id ?: it.slug },
                                contentType = { "game_card" }
                            ) { game ->
                                EpicGameListCard(
                                    game = game,
                                    isTogglingVisibility = uiState.togglingVisibilityId == game.id,
                                    isDeleting = uiState.isDeletingId == game.id,
                                    onToggleVisibility = { viewModel.toggleVisibility(game) },
                                    onEdit = { onEditGame(game.id!!) },
                                    onDelete = { viewModel.requestDelete(game) }
                                )
                            }

                            item(key = "load_more_footer") {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (uiState.isLoadingMore) {
                                        GameCardSkeleton()
                                    } else if (uiState.hasReachedEnd && uiState.games.isNotEmpty()) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Box(
                                                Modifier
                                                    .size(4.dp)
                                                    .background(
                                                        GamerBhiduAdminTheme.colors.textTertiary,
                                                        CircleShape
                                                    )
                                            )
                                            Text(
                                                "All ${uiState.games.size} games loaded",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    color = GamerBhiduAdminTheme.colors.textTertiary
                                                )
                                            )
                                            Box(
                                                Modifier
                                                    .size(4.dp)
                                                    .background(
                                                        GamerBhiduAdminTheme.colors.textTertiary,
                                                        CircleShape
                                                    )
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // ── Collapsible Single-Row Header (GPU Translated Layer) ─────────
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter)
                        .graphicsLayer {
                            translationY = headerOffset
                            alpha = ((headerOffset + headerHeightPx) / headerHeightPx).coerceIn(0f, 1f)
                        },
                    color = GamerBhiduAdminTheme.colors.surface,
                    tonalElevation = 0.dp
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .padding(horizontal = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            // Arrow symbol (no surrounding circle)
                            IconButton(
                                onClick = onNavigateBack,
                                modifier = Modifier.size(40.dp)
                            ) {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Back",
                                    tint = GamerBhiduAdminTheme.colors.textPrimary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            // Modern rounded pill search bar
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(40.dp)
                                    .background(
                                        color = GamerBhiduAdminTheme.colors.surfaceVariant,
                                        shape = CircleShape
                                    )
                                    .border(
                                        width = 1.dp,
                                        color = GamerBhiduAdminTheme.colors.borderSubtle,
                                        shape = CircleShape
                                    )
                                    .padding(horizontal = 14.dp),
                                contentAlignment = Alignment.CenterStart
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(
                                        Icons.Default.Search,
                                        contentDescription = null,
                                        tint = GamerBhiduAdminTheme.colors.textSecondary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Box(modifier = Modifier.weight(1f)) {
                                        if (uiState.searchQuery.isEmpty()) {
                                            Text(
                                                "Search games catalog…",
                                                style = MaterialTheme.typography.bodyMedium.copy(
                                                    color = GamerBhiduAdminTheme.colors.textTertiary,
                                                    fontSize = 13.sp
                                                )
                                            )
                                        }
                                        BasicTextField(
                                            value = uiState.searchQuery,
                                            onValueChange = viewModel::onSearchChange,
                                            singleLine = true,
                                            textStyle = MaterialTheme.typography.bodyMedium.copy(
                                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                                fontSize = 13.sp
                                            ),
                                            cursorBrush = SolidColor(GamerBhiduAdminTheme.colors.primary),
                                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                    }
                                    if (uiState.searchQuery.isNotEmpty()) {
                                        Icon(
                                            Icons.Default.Clear,
                                            contentDescription = "Clear",
                                            tint = GamerBhiduAdminTheme.colors.textSecondary,
                                            modifier = Modifier
                                                .size(16.dp)
                                                .clickable { viewModel.onSearchChange("") }
                                        )
                                    }
                                }
                            }

                            // Filter symbol (no surrounding circle)
                            Box(contentAlignment = Alignment.Center) {
                                IconButton(
                                    onClick = { filterOpen = true },
                                    modifier = Modifier.size(40.dp)
                                ) {
                                    Icon(
                                        Icons.Default.FilterList,
                                        contentDescription = "Filters",
                                        tint = if (activeFilters > 0)
                                            GamerBhiduAdminTheme.colors.primary
                                        else GamerBhiduAdminTheme.colors.textSecondary,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                                if (activeFilters > 0) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .align(Alignment.TopEnd)
                                            .offset(x = (-8).dp, y = 8.dp)
                                            .background(
                                                color = GamerBhiduAdminTheme.colors.primary,
                                                shape = CircleShape
                                            )
                                    )
                                }
                            }
                        }

                        HorizontalDivider(
                            color = GamerBhiduAdminTheme.colors.borderSubtle,
                            thickness = 1.dp
                        )
                    }
                }
            }
        }

        // ── Epic Filter Panel ────────────────────────────────────────────────
        BackHandler(enabled = filterOpen) {
            filterOpen = false
        }

        AnimatedVisibility(
            visible = filterOpen,
            enter = fadeIn(tween(durationMillis = 350, easing = FastOutSlowInEasing)),
            exit = fadeOut(tween(durationMillis = 300, easing = FastOutSlowInEasing)),
            modifier = Modifier.zIndex(10f)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.6f),
                                Color.Black.copy(alpha = 0.7f)
                            )
                        )
                    )
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { filterOpen = false }
            )
        }

        AnimatedVisibility(
            visible = filterOpen,
            enter = slideInHorizontally(
                animationSpec = tween(
                    durationMillis = 350,
                    easing = CubicBezierEasing(0.16f, 1f, 0.3f, 1f)
                ),
                initialOffsetX = { it }
            ),
            exit = slideOutHorizontally(
                animationSpec = tween(durationMillis = 280, easing = FastOutSlowInEasing),
                targetOffsetX = { it }
            ),
            modifier = Modifier.zIndex(11f)
        ) {
            EpicFilterPanel(
                selectedVisibility = uiState.selectedVisibility,
                onVisibilitySelected = viewModel::onVisibilitySelected,
                selectedStatus = uiState.selectedStatus,
                onStatusSelected = viewModel::onStatusSelected,
                onClearAll = {
                    viewModel.onVisibilitySelected("all")
                    viewModel.onStatusSelected("all")
                },
                onClose = { filterOpen = false }
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// EPIC FILTER PANEL
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun EpicFilterPanel(
    selectedVisibility: String,
    onVisibilitySelected: (String) -> Unit,
    selectedStatus: String,
    onStatusSelected: (String) -> Unit,
    onClearAll: () -> Unit,
    onClose: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClose
            ),
        contentAlignment = Alignment.CenterEnd
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(0.78f)
                .shadow(
                    elevation = 24.dp,
                    shape = RoundedCornerShape(topStart = 28.dp, bottomStart = 28.dp),
                    ambientColor = GamerBhiduAdminTheme.colors.glowBlue,
                    spotColor = GamerBhiduAdminTheme.colors.glowBlue
                )
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            GamerBhiduAdminTheme.colors.surface,
                            GamerBhiduAdminTheme.colors.background.copy(alpha = 0.98f)
                        )
                    )
                )
                .border(
                    width = 1.dp,
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color.Transparent,
                            GamerBhiduAdminTheme.colors.borderLight
                        )
                    ),
                    shape = RoundedCornerShape(topStart = 28.dp, bottomStart = 28.dp)
                )
                .clip(RoundedCornerShape(topStart = 28.dp, bottomStart = 28.dp))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = {}
                )
                .padding(bottom = 20.dp)
        ) {
            // Epic Panel Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.05f),
                                Color.Transparent
                            )
                        )
                    )
                    .statusBarsPadding()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            "FILTERS",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = GamerBhiduAdminTheme.colors.textTertiary,
                                letterSpacing = 2.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            "Refine your catalog",
                            style = MaterialTheme.typography.titleMedium.copy(
                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = onClearAll,
                            contentPadding = PaddingValues(horizontal = 12.dp)
                        ) {
                            Text(
                                "Clear All",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    color = GamerBhiduAdminTheme.colors.textSecondary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(
                                    color = GamerBhiduAdminTheme.colors.surfaceVariant,
                                    shape = CircleShape
                                )
                                .border(
                                    width = 1.dp,
                                    color = GamerBhiduAdminTheme.colors.borderLight,
                                    shape = CircleShape
                                )
                                .clickable { onClose() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Close",
                                tint = GamerBhiduAdminTheme.colors.textSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            HorizontalDivider(
                color = GamerBhiduAdminTheme.colors.border.copy(alpha = 0.4f),
                thickness = 0.5.dp
            )
            Spacer(Modifier.height(12.dp))

            // Visibility Section
            EpicFilterSection(title = "VISIBILITY") {
                listOf(
                    Triple("all", "All Games", Icons.Default.AppsOutage),
                    Triple("visible", "Visible", Icons.Default.Visibility),
                    Triple("hidden", "Hidden", Icons.Default.VisibilityOff),
                ).forEach { (value, label, icon) ->
                    EpicFilterOptionRow(
                        label = label,
                        icon = icon,
                        selected = selectedVisibility == value,
                        color = when (value) {
                            "visible" -> GamerBhiduAdminTheme.colors.success
                            "hidden" -> GamerBhiduAdminTheme.colors.warning
                            else -> GamerBhiduAdminTheme.colors.textSecondary
                        },
                        onClick = { onVisibilitySelected(value) }
                    )
                }
            }

            Spacer(Modifier.height(8.dp))
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = 20.dp),
                color = GamerBhiduAdminTheme.colors.border.copy(alpha = 0.4f),
                thickness = 0.5.dp
            )
            Spacer(Modifier.height(8.dp))

            // Status Section
            EpicFilterSection(title = "RELEASE STATUS") {
                listOf(
                    Triple("all", "All Statuses", Icons.Default.AppsOutage),
                    Triple("released", "Released", Icons.Default.CheckCircle),
                    Triple("upcoming", "Upcoming", Icons.Default.Schedule),
                ).forEach { (value, label, icon) ->
                    EpicFilterOptionRow(
                        label = label,
                        icon = icon,
                        selected = selectedStatus == value,
                        color = when (value) {
                            "released" -> GamerBhiduAdminTheme.colors.statusReleased
                            "upcoming" -> GamerBhiduAdminTheme.colors.statusUpcoming
                            else -> GamerBhiduAdminTheme.colors.textSecondary
                        },
                        onClick = { onStatusSelected(value) }
                    )
                }
            }
        }
    }
}

@Composable
private fun EpicFilterSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
        Text(
            title,
            style = MaterialTheme.typography.labelSmall.copy(
                color = GamerBhiduAdminTheme.colors.textTertiary,
                letterSpacing = 2.sp,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp
            ),
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
        )
        content()
    }
}

@Composable
private fun EpicFilterOptionRow(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    selected: Boolean,
    color: Color,
    onClick: () -> Unit
) {
    val scale by animateFloatAsState(
        targetValue = if (selected) 1.02f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "filterScale"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
            .scale(scale)
            .clip(RoundedCornerShape(12.dp))
            .background(
                brush = if (selected) {
                    Brush.horizontalGradient(
                        colors = listOf(
                            color.copy(alpha = 0.15f),
                            color.copy(alpha = 0.05f)
                        )
                    )
                } else {
                    Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))
                }
            )
            .border(
                width = if (selected) 1.dp else 0.dp,
                brush = if (selected) {
                    Brush.horizontalGradient(
                        colors = listOf(
                            color.copy(alpha = 0.4f),
                            color.copy(alpha = 0.1f)
                        )
                    )
                } else {
                    Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))
                },
                shape = RoundedCornerShape(12.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 13.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (selected) color else GamerBhiduAdminTheme.colors.textTertiary,
                modifier = Modifier.size(18.dp)
            )
            Text(
                label,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = if (selected) color else GamerBhiduAdminTheme.colors.textSecondary,
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                ),
                modifier = Modifier.weight(1f)
            )
            if (selected) {
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(color, color.copy(alpha = 0.8f))
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// CLEAN GAME LIST CARD
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun EpicGameListCard(
    game: Game,
    isTogglingVisibility: Boolean,
    isDeleting: Boolean,
    onToggleVisibility: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val statusColor = if (game.releaseStatus == "upcoming") 
        GamerBhiduAdminTheme.colors.statusUpcoming 
    else GamerBhiduAdminTheme.colors.statusReleased
    val visibilityColor = if (game.visible) 
        GamerBhiduAdminTheme.colors.success 
    else GamerBhiduAdminTheme.colors.warning

    var menuExpanded by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = GamerBhiduAdminTheme.colors.surface,
        tonalElevation = 0.dp
    ) {
        Row(
            modifier = Modifier
                .border(
                    width = 1.dp,
                    color = GamerBhiduAdminTheme.colors.borderSubtle,
                    shape = RoundedCornerShape(12.dp)
                )
                .clickable { onEdit() }
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Thumbnail (3:4 portrait poster ratio)
            Box(
                modifier = Modifier
                    .size(width = 78.dp, height = 104.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(GamerBhiduAdminTheme.colors.surfaceVariant)
            ) {
                val context = LocalContext.current
                val resolvedUrl = remember(game.imageUrl) { resolveImageUrl(game.imageUrl) }
                val imageRequest = remember(resolvedUrl, context) {
                    ImageRequest.Builder(context)
                        .data(resolvedUrl)
                        .crossfade(true)
                        .size(240, 320)
                        .build()
                }
                AsyncImage(
                    model = imageRequest,
                    contentDescription = game.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Discount Badge
                if (game.discountPercentage != null && game.discountPercentage > 0) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .background(
                                color = GamerBhiduAdminTheme.colors.success,
                                shape = RoundedCornerShape(bottomStart = 6.dp)
                            )
                            .padding(horizontal = 5.dp, vertical = 2.dp)
                    ) {
                        Text(
                            "-${game.discountPercentage}%",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        )
                    }
                }
            }

            // Info
            Column(
                modifier = Modifier
                    .weight(1f)
                    .height(104.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        game.title,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = GamerBhiduAdminTheme.colors.textPrimary,
                            fontSize = 15.sp
                        ),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        EpicStatusBadge(
                            text = if (game.releaseStatus == "upcoming") "Upcoming" else "Released",
                            color = statusColor
                        )
                        EpicStatusBadge(
                            text = if (game.visible) "Live" else "Hidden",
                            color = visibilityColor
                        )
                    }
                }

                if (game.sellingPrice != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            "₹${game.sellingPrice.toInt()}",
                            style = MaterialTheme.typography.titleMedium.copy(
                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        )
                        if (game.originalPrice != null && game.originalPrice > game.sellingPrice) {
                            Text(
                                "₹${game.originalPrice.toInt()}",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = GamerBhiduAdminTheme.colors.textTertiary,
                                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                                )
                            )
                        }
                    }
                }
            }

            // Quick Actions
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Quick Visibility Toggle Button
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .background(
                            color = GamerBhiduAdminTheme.colors.surfaceVariant,
                            shape = CircleShape
                        )
                        .clickable { onToggleVisibility() },
                    contentAlignment = Alignment.Center
                ) {
                    if (isTogglingVisibility) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(14.dp),
                            color = GamerBhiduAdminTheme.colors.primary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            if (game.visible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = if (game.visible) "Visible" else "Hidden",
                            tint = if (game.visible) 
                                GamerBhiduAdminTheme.colors.success 
                            else GamerBhiduAdminTheme.colors.textTertiary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                // 3-Dot Overflow Menu
                Box {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .background(
                                color = GamerBhiduAdminTheme.colors.surfaceVariant,
                                shape = CircleShape
                            )
                            .clickable { menuExpanded = true },
                        contentAlignment = Alignment.Center
                    ) {
                        if (isDeleting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(14.dp),
                                color = GamerBhiduAdminTheme.colors.error,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                Icons.Default.MoreVert,
                                contentDescription = "More actions",
                                tint = GamerBhiduAdminTheme.colors.textSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = { menuExpanded = false },
                        modifier = Modifier.background(GamerBhiduAdminTheme.colors.surface)
                    ) {
                        DropdownMenuItem(
                            text = { Text("Edit Game", color = GamerBhiduAdminTheme.colors.textPrimary) },
                            onClick = {
                                menuExpanded = false
                                onEdit()
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Edit,
                                    contentDescription = null,
                                    tint = GamerBhiduAdminTheme.colors.textSecondary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        )
                        DropdownMenuItem(
                            text = {
                                Text(
                                    if (game.visible) "Hide from store" else "Show on store",
                                    color = GamerBhiduAdminTheme.colors.textPrimary
                                )
                            },
                            onClick = {
                                menuExpanded = false
                                onToggleVisibility()
                            },
                            leadingIcon = {
                                Icon(
                                    if (game.visible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = GamerBhiduAdminTheme.colors.textSecondary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        )
                        HorizontalDivider(color = GamerBhiduAdminTheme.colors.borderSubtle)
                        DropdownMenuItem(
                            text = { Text("Delete", color = GamerBhiduAdminTheme.colors.error) },
                            onClick = {
                                menuExpanded = false
                                onDelete()
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.DeleteOutline,
                                    contentDescription = null,
                                    tint = GamerBhiduAdminTheme.colors.error,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EpicStatusBadge(text: String, color: Color) {
    Box(
        modifier = Modifier
            .background(
                color = color.copy(alpha = 0.12f),
                shape = RoundedCornerShape(4.dp)
            )
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall.copy(
                color = color,
                fontWeight = FontWeight.Medium,
                fontSize = 10.sp
            )
        )
    }
}