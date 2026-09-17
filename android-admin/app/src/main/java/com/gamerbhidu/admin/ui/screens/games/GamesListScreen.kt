package com.gamerbhidu.admin.ui.screens.games

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.FormatListBulleted
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.ui.components.GameCardSkeleton
import com.gamerbhidu.admin.ui.components.GamesListSkeleton
import com.gamerbhidu.admin.ui.theme.*
import com.gamerbhidu.admin.util.resolveImageUrl
import kotlinx.coroutines.flow.distinctUntilChanged

private val ALL_GENRES = listOf(
    "All", "Action", "Adventure", "RPG", "Strategy",
    "Shooter", "Sports", "Racing", "Horror", "Open World", "Indie"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesListScreen(
    onNavigateBack: () -> Unit,
    onAddGame: () -> Unit,
    onEditGame: (String) -> Unit,
    viewModel: GamesListViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val displayedGames = uiState.displayedGames

    // Delete Confirmation Dialog
    uiState.deleteConfirmGame?.let { game ->
        AlertDialog(
            onDismissRequest = viewModel::cancelDelete,
            title = {
                Text(
                    "Delete Game?",
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    "\"${game.title}\" will be permanently deleted from the catalog and store. This cannot be undone.",
                    color = Color(0xFFA1A1AA),
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(onClick = viewModel::confirmDelete) {
                    Text("Delete", color = GamerBhiduAdminTheme.colors.error, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = viewModel::cancelDelete) {
                    Text("Cancel", color = Color(0xFFA1A1AA))
                }
            },
            containerColor = Color(0xFF141414),
            shape = RoundedCornerShape(18.dp)
        )
    }

    val gridState = rememberLazyGridState()
    val listState = rememberLazyListState()

    // Pagination for grid mode
    LaunchedEffect(gridState, uiState.viewMode) {
        if (uiState.viewMode == "grid") {
            snapshotFlow {
                val total = gridState.layoutInfo.totalItemsCount
                val last = gridState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                last >= total - 6 && total > 0
            }
                .distinctUntilChanged()
                .collect { shouldLoad ->
                    if (shouldLoad) viewModel.loadNextPage()
                }
        }
    }

    // Pagination for table mode
    LaunchedEffect(listState, uiState.viewMode) {
        if (uiState.viewMode != "grid") {
            snapshotFlow {
                val total = listState.layoutInfo.totalItemsCount
                val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                last >= total - 4 && total > 0
            }
                .distinctUntilChanged()
                .collect { shouldLoad ->
                    if (shouldLoad) viewModel.loadNextPage()
                }
        }
    }

    var filterOpen by remember { mutableStateOf(false) }

    val activeFilters = buildList {
        if (uiState.selectedVisibility != "all") add(uiState.selectedVisibility)
        if (uiState.selectedStatus != "all") add(uiState.selectedStatus)
        if (uiState.selectedGenre != "All") add(uiState.selectedGenre)
    }.size

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(GamerBhiduAdminTheme.colors.backgroundDeep)
    ) {
        Scaffold(
            floatingActionButton = {
                FloatingActionButton(
                    onClick = onAddGame,
                    containerColor = Color.White,
                    contentColor = Color.Black,
                    shape = RoundedCornerShape(16.dp),
                    elevation = FloatingActionButtonDefaults.elevation(
                        defaultElevation = 8.dp,
                        pressedElevation = 12.dp
                    )
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Game", modifier = Modifier.size(26.dp))
                }
            },
            containerColor = Color.Transparent,
            contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .statusBarsPadding()
            ) {
                // ── Top Header Controls (Matching Web Filter Bar) ───────────────
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0D0D0D))
                        .padding(bottom = 8.dp)
                ) {
                    // Row 1: Back + Search + View Mode Switcher + Filter + Add
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .padding(horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        IconButton(
                            onClick = onNavigateBack,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // Search Bar
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(38.dp)
                                .background(Color(0xFF141414), RoundedCornerShape(10.dp))
                                .border(1.dp, Color(0xFF262626), RoundedCornerShape(10.dp))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    Icons.Default.Search,
                                    contentDescription = null,
                                    tint = Color(0xFFA1A1AA),
                                    modifier = Modifier.size(16.dp)
                                )
                                Box(modifier = Modifier.weight(1f)) {
                                    if (uiState.searchQuery.isEmpty()) {
                                        Text(
                                            "Search title, series, slug...",
                                            style = MaterialTheme.typography.bodyMedium.copy(
                                                color = Color(0xFF71717A),
                                                fontSize = 12.sp
                                            )
                                        )
                                    }
                                    BasicTextField(
                                        value = uiState.searchQuery,
                                        onValueChange = viewModel::onSearchChange,
                                        singleLine = true,
                                        textStyle = MaterialTheme.typography.bodyMedium.copy(
                                            color = Color.White,
                                            fontSize = 12.sp
                                        ),
                                        cursorBrush = SolidColor(Color.White),
                                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }
                                if (uiState.searchQuery.isNotEmpty()) {
                                    Icon(
                                        Icons.Default.Clear,
                                        contentDescription = "Clear",
                                        tint = Color(0xFFA1A1AA),
                                        modifier = Modifier
                                            .size(16.dp)
                                            .clickable { viewModel.onSearchChange("") }
                                    )
                                }
                            }
                        }

                        // View Mode Toggle (Grid vs Table)
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .background(Color(0xFF141414), RoundedCornerShape(10.dp))
                                .border(1.dp, Color(0xFF262626), RoundedCornerShape(10.dp))
                                .clickable {
                                    val nextMode = if (uiState.viewMode == "grid") "table" else "grid"
                                    viewModel.setViewMode(nextMode)
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (uiState.viewMode == "grid") Icons.Default.GridView else Icons.AutoMirrored.Filled.FormatListBulleted,
                                contentDescription = "Toggle View Mode",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        // Advanced Filter Drawer Button
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .background(Color(0xFF141414), RoundedCornerShape(10.dp))
                                .border(
                                    width = 1.dp,
                                    color = if (activeFilters > 0) Color.White else Color(0xFF262626),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .clickable { filterOpen = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.FilterList,
                                contentDescription = "Filters",
                                tint = if (activeFilters > 0) Color.White else Color(0xFFA1A1AA),
                                modifier = Modifier.size(18.dp)
                            )
                            if (activeFilters > 0) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .align(Alignment.TopEnd)
                                        .offset(x = (-4).dp, y = 4.dp)
                                        .background(Color.White, CircleShape)
                                )
                            }
                        }
                    }

                    // Row 2: Horizontal Genre Pill Bar (Matching Web Admin GamesFilterBar)
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        items(ALL_GENRES, key = { it }) { genre ->
                            val isSelected = uiState.selectedGenre.equals(genre, ignoreCase = true)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        if (isSelected) Color.White else Color(0xFF141414)
                                    )
                                    .border(
                                        width = 1.dp,
                                        color = if (isSelected) Color.White else Color(0xFF262626),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .clickable { viewModel.onGenreSelected(genre) }
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = genre,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = if (isSelected) Color.Black else Color(0xFFA1A1AA),
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        fontSize = 11.sp
                                    )
                                )
                            }
                        }
                    }

                    // Row 3: Quick Status & Visibility Tabs + Live Counter
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 10.dp, vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            // All
                            QuickFilterPill(
                                text = "All",
                                isSelected = uiState.selectedVisibility == "all" && uiState.selectedStatus == "all",
                                onClick = {
                                    viewModel.onVisibilitySelected("all")
                                    viewModel.onStatusSelected("all")
                                }
                            )

                            // Live
                            QuickFilterPill(
                                text = "Live",
                                dotColor = Success,
                                isSelected = uiState.selectedVisibility == "visible",
                                onClick = {
                                    viewModel.onVisibilitySelected(if (uiState.selectedVisibility == "visible") "all" else "visible")
                                }
                            )

                            // Hidden
                            QuickFilterPill(
                                text = "Hidden",
                                dotColor = Color(0xFF71717A),
                                isSelected = uiState.selectedVisibility == "hidden",
                                onClick = {
                                    viewModel.onVisibilitySelected(if (uiState.selectedVisibility == "hidden") "all" else "hidden")
                                }
                            )

                            // Upcoming
                            QuickFilterPill(
                                text = "Upcoming",
                                dotColor = Warning,
                                isSelected = uiState.selectedStatus == "upcoming",
                                onClick = {
                                    viewModel.onStatusSelected(if (uiState.selectedStatus == "upcoming") "all" else "upcoming")
                                }
                            )
                        }

                        // Game Count Badge
                        Text(
                            text = "${displayedGames.size} titles",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = Color(0xFF71717A),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }

                    HorizontalDivider(
                        color = Color(0xFF1F1F1F),
                        thickness = 1.dp,
                        modifier = Modifier.padding(top = 6.dp)
                    )
                }

                // ── Content Area (Grid Mode vs Table Mode) ──────────────────────
                when {
                    uiState.isLoading -> {
                        Box(modifier = Modifier.fillMaxSize()) {
                            GamesListSkeleton()
                        }
                    }

                    displayedGames.isEmpty() -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(64.dp)
                                        .background(Color(0xFF141414), CircleShape)
                                        .border(1.dp, Color(0xFF262626), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.SearchOff,
                                        contentDescription = null,
                                        tint = Color(0xFF71717A),
                                        modifier = Modifier.size(30.dp)
                                    )
                                }
                                Text(
                                    "No games found",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    "Try adjusting your search or genre filters",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = Color(0xFFA1A1AA)
                                    )
                                )
                            }
                        }
                    }

                    uiState.viewMode == "grid" -> {
                        // 2-Column Card Grid (Matching Web Grid View)
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(2),
                            state = gridState,
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(
                                start = 12.dp,
                                end = 12.dp,
                                top = 12.dp,
                                bottom = 96.dp
                            ),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Error banner
                            uiState.error?.let { error ->
                                item(span = { GridItemSpan(2) }, key = "error_banner") {
                                    ErrorBanner(error = error, onDismiss = viewModel::clearError)
                                }
                            }

                            items(
                                items = displayedGames,
                                key = { it.id ?: it.slug }
                            ) { game ->
                                GameGridCard(
                                    game = game,
                                    isTogglingVisibility = uiState.togglingVisibilityId == game.id,
                                    isDeleting = uiState.isDeletingId == game.id,
                                    onToggleVisibility = { viewModel.toggleVisibility(game) },
                                    onEdit = { onEditGame(game.id!!) },
                                    onDelete = { viewModel.requestDelete(game) }
                                )
                            }

                            item(span = { GridItemSpan(2) }, key = "load_more_footer") {
                                LoadMoreFooter(
                                    isLoadingMore = uiState.isLoadingMore,
                                    hasReachedEnd = uiState.hasReachedEnd,
                                    totalCount = displayedGames.size
                                )
                            }
                        }
                    }

                    else -> {
                        // Dense Compact Table View (Matching Web Table View)
                        LazyColumn(
                            state = listState,
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(
                                start = 12.dp,
                                end = 12.dp,
                                top = 12.dp,
                                bottom = 96.dp
                            ),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Error banner
                            uiState.error?.let { error ->
                                item(key = "error_banner") {
                                    ErrorBanner(error = error, onDismiss = viewModel::clearError)
                                }
                            }

                            items(
                                items = displayedGames,
                                key = { it.id ?: it.slug }
                            ) { game ->
                                GameTableRow(
                                    game = game,
                                    isTogglingVisibility = uiState.togglingVisibilityId == game.id,
                                    isDeleting = uiState.isDeletingId == game.id,
                                    onToggleVisibility = { viewModel.toggleVisibility(game) },
                                    onEdit = { onEditGame(game.id!!) },
                                    onDelete = { viewModel.requestDelete(game) }
                                )
                            }

                            item(key = "load_more_footer") {
                                LoadMoreFooter(
                                    isLoadingMore = uiState.isLoadingMore,
                                    hasReachedEnd = uiState.hasReachedEnd,
                                    totalCount = displayedGames.size
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── Filter Panel Drawer ──────────────────────────────────────────────
        BackHandler(enabled = filterOpen) {
            filterOpen = false
        }

        AnimatedVisibility(
            visible = filterOpen,
            enter = fadeIn(tween(durationMillis = 300)),
            exit = fadeOut(tween(durationMillis = 250)),
            modifier = Modifier.zIndex(10f)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { filterOpen = false }
            )
        }

        AnimatedVisibility(
            visible = filterOpen,
            enter = slideInHorizontally(
                animationSpec = tween(durationMillis = 320, easing = CubicBezierEasing(0.16f, 1f, 0.3f, 1f)),
                initialOffsetX = { it }
            ),
            exit = slideOutHorizontally(
                animationSpec = tween(durationMillis = 260, easing = FastOutSlowInEasing),
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
                    viewModel.onGenreSelected("All")
                },
                onClose = { filterOpen = false }
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// QUICK FILTER PILL
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun QuickFilterPill(
    text: String,
    dotColor: Color? = null,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (isSelected) Color.White.copy(alpha = 0.15f) else Color.Transparent)
            .border(
                width = 0.5.dp,
                color = if (isSelected) Color.White.copy(alpha = 0.3f) else Color(0xFF262626),
                shape = RoundedCornerShape(6.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            if (dotColor != null) {
                Box(
                    modifier = Modifier
                        .size(5.dp)
                        .background(dotColor, CircleShape)
                )
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelSmall.copy(
                    color = if (isSelected) Color.White else Color(0xFFA1A1AA),
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    fontSize = 10.sp
                )
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// 2-COLUMN GRID CARD (MATCHING WEB GAMES TABLE)
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun GameGridCard(
    game: Game,
    isTogglingVisibility: Boolean,
    isDeleting: Boolean,
    onToggleVisibility: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onEdit),
        color = Color(0xFF0D0D0D),
        border = BorderStroke(1.dp, Color(0xFF1F1F1F)),
        shape = RoundedCornerShape(14.dp),
        tonalElevation = 0.dp
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Cover Art (3:4 portrait poster ratio)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(3f / 4f)
                    .background(Color(0xFF141414))
            ) {
                val context = LocalContext.current
                val resolvedUrl = remember(game.imageUrl) { resolveImageUrl(game.imageUrl) }
                val imageRequest = remember(resolvedUrl, context) {
                    ImageRequest.Builder(context)
                        .data(resolvedUrl)
                        .crossfade(true)
                        .size(360, 480)
                        .build()
                }
                AsyncImage(
                    model = imageRequest,
                    contentDescription = game.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Bottom subtle gradient
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    Color.Black.copy(alpha = 0.5f),
                                    Color(0xFF0D0D0D)
                                )
                            )
                        )
                )

                // Top badges overlay: Status dot + Discount tag
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(7.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val (dotColor, statusText) = when {
                        game.releaseStatus == "upcoming" -> Warning to "UPCOMING"
                        game.visible -> Success to "LIVE"
                        else -> Color(0xFF71717A) to "HIDDEN"
                    }

                    Box(
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.8f), RoundedCornerShape(14.dp))
                            .border(0.5.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(14.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.5.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(5.dp)
                                    .background(dotColor, CircleShape)
                            )
                            Text(
                                text = statusText,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 8.5.sp,
                                    letterSpacing = 0.4.sp
                                )
                            )
                        }
                    }

                    if (game.discountPercentage != null && game.discountPercentage > 0) {
                        Box(
                            modifier = Modifier
                                .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                .border(0.5.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 4.dp, vertical = 1.5.dp)
                        ) {
                            Text(
                                text = "-${game.discountPercentage}%",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 9.sp
                                )
                            )
                        }
                    }
                }
            }

            // Card Body
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(9.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = game.title,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 12.5.sp
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = game.series?.ifEmpty { "/${game.slug}" } ?: "/${game.slug}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = Color(0xFF71717A),
                        fontSize = 9.5.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Genre chips
                if (game.genre.isNotEmpty()) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        game.genre.take(2).forEach { g ->
                            Box(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.05f), RoundedCornerShape(3.dp))
                                    .border(0.5.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(3.dp))
                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = g,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = Color(0xFFA1A1AA),
                                        fontSize = 8.5.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(
                    color = Color(0xFF1F1F1F),
                    thickness = 0.5.dp,
                    modifier = Modifier.padding(top = 2.dp)
                )

                // Price & Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        if (game.sellingPrice != null) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                Text(
                                    text = "₹${game.sellingPrice.toInt()}",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        fontSize = 13.sp
                                    )
                                )
                                if (game.originalPrice != null && game.originalPrice > game.sellingPrice) {
                                    Text(
                                        text = "₹${game.originalPrice.toInt()}",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = Color(0xFF71717A),
                                            textDecoration = TextDecoration.LineThrough,
                                            fontSize = 9.sp
                                        )
                                    )
                                }
                            }
                        } else {
                            Text(
                                text = "Free / TBA",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = Color(0xFF71717A),
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }

                    // Inline Action Icons
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(0.dp)
                    ) {
                        IconButton(
                            onClick = onToggleVisibility,
                            modifier = Modifier.size(26.dp)
                        ) {
                            if (isTogglingVisibility) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(11.dp),
                                    color = Color.White,
                                    strokeWidth = 1.5.dp
                                )
                            } else {
                                Icon(
                                    imageVector = if (game.visible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                    contentDescription = if (game.visible) "Visible" else "Hidden",
                                    tint = if (game.visible) Success else Color(0xFF71717A),
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }

                        Box {
                            IconButton(
                                onClick = { menuExpanded = true },
                                modifier = Modifier.size(26.dp)
                            ) {
                                if (isDeleting) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(11.dp),
                                        color = GamerBhiduAdminTheme.colors.error,
                                        strokeWidth = 1.5.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Default.MoreVert,
                                        contentDescription = "Actions",
                                        tint = Color(0xFFA1A1AA),
                                        modifier = Modifier.size(15.dp)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = menuExpanded,
                                onDismissRequest = { menuExpanded = false },
                                modifier = Modifier.background(Color(0xFF141414))
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Edit Game", color = Color.White) },
                                    onClick = {
                                        menuExpanded = false
                                        onEdit()
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.Edit, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text(if (game.visible) "Hide from Store" else "Show on Store", color = Color.White) },
                                    onClick = {
                                        menuExpanded = false
                                        onToggleVisibility()
                                    },
                                    leadingIcon = {
                                        Icon(
                                            if (game.visible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                )
                                HorizontalDivider(color = Color(0xFF262626))
                                DropdownMenuItem(
                                    text = { Text("Delete", color = GamerBhiduAdminTheme.colors.error) },
                                    onClick = {
                                        menuExpanded = false
                                        onDelete()
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.DeleteOutline, contentDescription = null, tint = GamerBhiduAdminTheme.colors.error, modifier = Modifier.size(16.dp))
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPACT TABLE ROW (MATCHING WEB TABLE VIEW)
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun GameTableRow(
    game: Game,
    isTogglingVisibility: Boolean,
    isDeleting: Boolean,
    onToggleVisibility: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onEdit),
        color = Color(0xFF0D0D0D),
        border = BorderStroke(1.dp, Color(0xFF1F1F1F)),
        shape = RoundedCornerShape(12.dp),
        tonalElevation = 0.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Thumbnail (3:4 ratio)
            Box(
                modifier = Modifier
                    .size(width = 46.dp, height = 62.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xFF141414))
            ) {
                val context = LocalContext.current
                val resolvedUrl = remember(game.imageUrl) { resolveImageUrl(game.imageUrl) }
                val imageRequest = remember(resolvedUrl, context) {
                    ImageRequest.Builder(context)
                        .data(resolvedUrl)
                        .crossfade(true)
                        .size(140, 190)
                        .build()
                }
                AsyncImage(
                    model = imageRequest,
                    contentDescription = game.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            // Info column
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                Text(
                    text = game.title,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 13.sp
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = game.series?.ifEmpty { "/${game.slug}" } ?: "/${game.slug}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = Color(0xFF71717A),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val (dotColor, statusText) = when {
                        game.releaseStatus == "upcoming" -> Warning to "UPCOMING"
                        game.visible -> Success to "LIVE"
                        else -> Color(0xFF71717A) to "HIDDEN"
                    }
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .background(dotColor, CircleShape)
                        )
                        Text(
                            text = statusText,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = dotColor,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            )
                        )
                    }

                    if (game.sellingPrice != null) {
                        Text(
                            text = "• ₹${game.sellingPrice.toInt()}",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        )
                    }
                }
            }

            // Quick actions
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                IconButton(
                    onClick = onToggleVisibility,
                    modifier = Modifier.size(30.dp)
                ) {
                    if (isTogglingVisibility) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(12.dp),
                            color = Color.White,
                            strokeWidth = 1.5.dp
                        )
                    } else {
                        Icon(
                            imageVector = if (game.visible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = null,
                            tint = if (game.visible) Success else Color(0xFF71717A),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Box {
                    IconButton(
                        onClick = { menuExpanded = true },
                        modifier = Modifier.size(30.dp)
                    ) {
                        if (isDeleting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(12.dp),
                                color = GamerBhiduAdminTheme.colors.error,
                                strokeWidth = 1.5.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = null,
                                tint = Color(0xFFA1A1AA),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = { menuExpanded = false },
                        modifier = Modifier.background(Color(0xFF141414))
                    ) {
                        DropdownMenuItem(
                            text = { Text("Edit Game", color = Color.White) },
                            onClick = {
                                menuExpanded = false
                                onEdit()
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Edit, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            }
                        )
                        DropdownMenuItem(
                            text = { Text(if (game.visible) "Hide from Store" else "Show on Store", color = Color.White) },
                            onClick = {
                                menuExpanded = false
                                onToggleVisibility()
                            },
                            leadingIcon = {
                                Icon(
                                    if (game.visible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        )
                        HorizontalDivider(color = Color(0xFF262626))
                        DropdownMenuItem(
                            text = { Text("Delete", color = GamerBhiduAdminTheme.colors.error) },
                            onClick = {
                                menuExpanded = false
                                onDelete()
                            },
                            leadingIcon = {
                                Icon(Icons.Default.DeleteOutline, contentDescription = null, tint = GamerBhiduAdminTheme.colors.error, modifier = Modifier.size(16.dp))
                            }
                        )
                    }
                }
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// ERROR BANNER & LOAD MORE FOOTER
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun ErrorBanner(error: String, onDismiss: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(GamerBhiduAdminTheme.colors.errorSubtle, RoundedCornerShape(10.dp))
            .border(1.dp, GamerBhiduAdminTheme.colors.error.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
            .padding(10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(Icons.Default.Warning, null, tint = GamerBhiduAdminTheme.colors.error, modifier = Modifier.size(15.dp))
        Text(error, style = MaterialTheme.typography.bodySmall.copy(color = GamerBhiduAdminTheme.colors.error), modifier = Modifier.weight(1f))
        IconButton(onClick = onDismiss, modifier = Modifier.size(18.dp)) {
            Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = Color(0xFFA1A1AA), modifier = Modifier.size(12.dp))
        }
    }
}

@Composable
private fun LoadMoreFooter(
    isLoadingMore: Boolean,
    hasReachedEnd: Boolean,
    totalCount: Int
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        if (isLoadingMore) {
            GameCardSkeleton()
        } else if (hasReachedEnd && totalCount > 0) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(Modifier.size(4.dp).background(Color(0xFF71717A), CircleShape))
                Text(
                    "All $totalCount games loaded",
                    style = MaterialTheme.typography.labelSmall.copy(color = Color(0xFF71717A), fontSize = 10.sp)
                )
                Box(Modifier.size(4.dp).background(Color(0xFF71717A), CircleShape))
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// ADVANCED FILTER PANEL DRAWER
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
                .fillMaxWidth(0.80f)
                .shadow(elevation = 24.dp, shape = RoundedCornerShape(topStart = 24.dp, bottomStart = 24.dp))
                .background(Color(0xFF111111))
                .border(1.dp, Color(0xFF262626), RoundedCornerShape(topStart = 24.dp, bottomStart = 24.dp))
                .clip(RoundedCornerShape(topStart = 24.dp, bottomStart = 24.dp))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = {}
                )
                .padding(bottom = 20.dp)
        ) {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 18.dp, vertical = 14.dp)
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
                                color = Color(0xFF71717A),
                                letterSpacing = 2.sp,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            )
                        )
                        Text(
                            "Refine Catalog",
                            style = MaterialTheme.typography.titleMedium.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = onClearAll) {
                            Text(
                                "Reset",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    color = Color(0xFFA1A1AA),
                                    fontWeight = FontWeight.SemiBold
                                )
                            )
                        }
                        IconButton(onClick = onClose, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            HorizontalDivider(color = Color(0xFF1F1F1F), thickness = 1.dp)
            Spacer(Modifier.height(8.dp))

            // Visibility Section
            EpicFilterSection(title = "VISIBILITY") {
                listOf(
                    Triple("all", "All Games", Icons.Default.Apps),
                    Triple("visible", "Live / Visible", Icons.Default.Visibility),
                    Triple("hidden", "Hidden from Store", Icons.Default.VisibilityOff)
                ).forEach { (value, label, icon) ->
                    EpicFilterOptionRow(
                        label = label,
                        icon = icon,
                        selected = selectedVisibility == value,
                        color = when (value) {
                            "visible" -> Success
                            "hidden" -> Warning
                            else -> Color(0xFFA1A1AA)
                        },
                        onClick = { onVisibilitySelected(value) }
                    )
                }
            }

            Spacer(Modifier.height(8.dp))
            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = Color(0xFF1F1F1F), thickness = 0.5.dp)
            Spacer(Modifier.height(8.dp))

            // Status Section
            EpicFilterSection(title = "RELEASE STATUS") {
                listOf(
                    Triple("all", "All Statuses", Icons.Default.Apps),
                    Triple("released", "Released", Icons.Default.CheckCircle),
                    Triple("upcoming", "Upcoming", Icons.Default.Schedule)
                ).forEach { (value, label, icon) ->
                    EpicFilterOptionRow(
                        label = label,
                        icon = icon,
                        selected = selectedStatus == value,
                        color = when (value) {
                            "released" -> Success
                            "upcoming" -> Warning
                            else -> Color(0xFFA1A1AA)
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
    Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 4.dp)) {
        Text(
            title,
            style = MaterialTheme.typography.labelSmall.copy(
                color = Color(0xFF71717A),
                letterSpacing = 1.5.sp,
                fontWeight = FontWeight.Bold,
                fontSize = 9.5.sp
            ),
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
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
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(if (selected) color.copy(alpha = 0.12f) else Color.Transparent)
            .border(
                width = if (selected) 1.dp else 0.dp,
                color = if (selected) color.copy(alpha = 0.35f) else Color.Transparent,
                shape = RoundedCornerShape(10.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 10.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (selected) color else Color(0xFF71717A),
                modifier = Modifier.size(16.dp)
            )
            Text(
                label,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = if (selected) color else Color(0xFFA1A1AA),
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                    fontSize = 12.5.sp
                ),
                modifier = Modifier.weight(1f)
            )
            if (selected) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}