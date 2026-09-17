package com.gamerbhidu.admin.ui.screens.sections

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.platform.LocalContext
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.data.model.HomepageSection
import com.gamerbhidu.admin.data.model.SectionGameWithGame
import com.gamerbhidu.admin.ui.theme.GamerBhiduAdminTheme
import com.gamerbhidu.admin.util.resolveImageUrl

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomepageSectionsScreen(
    onNavigateBack: () -> Unit,
    viewModel: HomepageSectionsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // ── Error snackbar ───────────────────────────────────────────────────────
    uiState.error?.let { err ->
        LaunchedEffect(err) {
            viewModel.clearError()
        }
    }

    // ── Game picker bottom sheet ─────────────────────────────────────────────
    if (uiState.isPickerOpen) {
        GamePickerBottomSheet(
            games = uiState.pickerGames,
            query = uiState.pickerQuery,
            onQueryChange = viewModel::onPickerQueryChange,
            onSelectGame = viewModel::addGame,
            onDismiss = viewModel::closePicker
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(GamerBhiduAdminTheme.colors.backgroundDeep)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // ── Top Bar ─────────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                GamerBhiduAdminTheme.colors.surface,
                                GamerBhiduAdminTheme.colors.backgroundDeep
                            )
                        )
                    )
                    .statusBarsPadding()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        IconButton(onClick = onNavigateBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = GamerBhiduAdminTheme.colors.textPrimary
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Homepage Sections",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = GamerBhiduAdminTheme.colors.textPrimary
                                )
                            )
                            Text(
                                "Manage which games appear in each section",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = GamerBhiduAdminTheme.colors.textSecondary
                                )
                            )
                        }
                        // Refresh
                        IconButton(
                            onClick = viewModel::refresh,
                            enabled = !uiState.isSectionsLoading
                        ) {
                            Icon(
                                Icons.Default.Refresh,
                                contentDescription = "Refresh",
                                tint = GamerBhiduAdminTheme.colors.textSecondary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    // ── Section chips ────────────────────────────────────────
                    if (!uiState.isSectionsLoading && uiState.sections.isNotEmpty()) {
                        Spacer(Modifier.height(12.dp))
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp)
                        ) {
                            items(uiState.sections) { section ->
                                SectionChip(
                                    section = section,
                                    isActive = section.id == uiState.activeSectionId,
                                    onClick = { viewModel.selectSection(section.id) }
                                )
                            }
                        }
                    }
                }
            }

            // ── Body ─────────────────────────────────────────────────────────
            when {
                uiState.isSectionsLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(
                                color = GamerBhiduAdminTheme.colors.primary,
                                modifier = Modifier.size(32.dp),
                                strokeWidth = 2.dp
                            )
                            Text(
                                "Loading sections...",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = GamerBhiduAdminTheme.colors.textSecondary
                                )
                            )
                        }
                    }
                }

                uiState.error != null && uiState.sections.isEmpty() -> {
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
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                tint = GamerBhiduAdminTheme.colors.error,
                                modifier = Modifier.size(44.dp)
                            )
                            Text(
                                text = uiState.error ?: "Failed to load sections",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = GamerBhiduAdminTheme.colors.textSecondary,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            )
                            Button(
                                onClick = viewModel::refresh,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = GamerBhiduAdminTheme.colors.primary,
                                    contentColor = Color.Black
                                )
                            ) {
                                Text("Retry", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                uiState.sections.isEmpty() -> {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                Icons.Default.Layers,
                                contentDescription = null,
                                tint = GamerBhiduAdminTheme.colors.textTertiary,
                                modifier = Modifier.size(44.dp)
                            )
                            Text(
                                "No homepage sections found.",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = GamerBhiduAdminTheme.colors.textSecondary
                                )
                            )
                        }
                    }
                }

                else -> {
                    // Active section game list
                    SectionGamesList(
                        games = uiState.sectionGames,
                        isLoading = uiState.isSectionGamesLoading,
                        isReordering = uiState.isReordering,
                        removingGameId = uiState.removingGameId,
                        isAddingGame = uiState.isAddingGame,
                        sectionName = uiState.activeSection?.title ?: "",
                        onMoveUp = viewModel::moveUp,
                        onMoveDown = viewModel::moveDown,
                        onRemove = viewModel::removeGame
                    )
                }
            }
        }

        // ── FAB ─────────────────────────────────────────────────────────────
        if (!uiState.isSectionsLoading && uiState.sections.isNotEmpty()) {
            FloatingActionButton(
                onClick = viewModel::openPicker,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .navigationBarsPadding()
                    .padding(20.dp),
                containerColor = GamerBhiduAdminTheme.colors.primary,
                contentColor = Color.Black,
                shape = RoundedCornerShape(16.dp),
                elevation = FloatingActionButtonDefaults.elevation(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Add game to section",
                        tint = Color.Black,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        "Add Game",
                        style = MaterialTheme.typography.labelLarge.copy(
                            color = Color.Black,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }

        // ── Error banner ─────────────────────────────────────────────────────
        AnimatedVisibility(
            visible = uiState.error != null,
            enter = slideInVertically(initialOffsetY = { it }),
            exit = slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 80.dp, start = 16.dp, end = 16.dp)
        ) {
            uiState.error?.let { err ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = GamerBhiduAdminTheme.colors.errorSubtle
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = null,
                            tint = GamerBhiduAdminTheme.colors.error,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            err,
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = GamerBhiduAdminTheme.colors.error
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section chip
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SectionChip(
    section: HomepageSection,
    isActive: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(
                if (isActive) GamerBhiduAdminTheme.colors.primary
                else GamerBhiduAdminTheme.colors.surface
            )
            .border(
                width = 1.dp,
                color = if (isActive) GamerBhiduAdminTheme.colors.primary
                        else GamerBhiduAdminTheme.colors.borderSubtle,
                shape = RoundedCornerShape(20.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 7.dp)
    ) {
        Text(
            text = section.title,
            style = MaterialTheme.typography.labelMedium.copy(
                color = if (isActive) Color.Black
                        else GamerBhiduAdminTheme.colors.textSecondary,
                fontWeight = if (isActive) FontWeight.SemiBold else FontWeight.Normal
            )
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section games list
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SectionGamesList(
    games: List<SectionGameWithGame>,
    isLoading: Boolean,
    isReordering: Boolean,
    removingGameId: String?,
    isAddingGame: Boolean,
    sectionName: String,
    onMoveUp: (Int) -> Unit,
    onMoveDown: (Int) -> Unit,
    onRemove: (String) -> Unit
) {
    when {
        isLoading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    color = GamerBhiduAdminTheme.colors.primary,
                    modifier = Modifier.size(28.dp),
                    strokeWidth = 2.dp
                )
            }
        }

        games.isEmpty() && !isAddingGame -> {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .background(
                                GamerBhiduAdminTheme.colors.surface,
                                RoundedCornerShape(16.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Home,
                            contentDescription = null,
                            tint = GamerBhiduAdminTheme.colors.textTertiary,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                    Text(
                        "No games in \"$sectionName\"",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = GamerBhiduAdminTheme.colors.textPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    Text(
                        "Tap the \"Add Game\" button below to add games to this section.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textSecondary
                        ),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        }

        else -> {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    start = 16.dp,
                    end = 16.dp,
                    top = 12.dp,
                    bottom = 100.dp
                ),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Header row
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${games.size} game${if (games.size != 1) "s" else ""} in \"$sectionName\"",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = GamerBhiduAdminTheme.colors.textSecondary
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        if (isReordering) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(14.dp),
                                color = GamerBhiduAdminTheme.colors.primary,
                                strokeWidth = 1.5.dp
                            )
                        }
                    }
                }

                // Adding indicator
                if (isAddingGame) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.08f),
                                    RoundedCornerShape(12.dp)
                                )
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = GamerBhiduAdminTheme.colors.primary,
                                strokeWidth = 2.dp
                            )
                            Text(
                                "Adding game to section...",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = GamerBhiduAdminTheme.colors.primary
                                )
                            )
                        }
                    }
                }

                itemsIndexed(games) { index, game ->
                    SectionGameCard(
                        game = game,
                        position = index + 1,
                        totalCount = games.size,
                        isRemoving = removingGameId == game.sectionGameId,
                        onMoveUp = { onMoveUp(index) },
                        onMoveDown = { onMoveDown(index) },
                        onRemove = { onRemove(game.sectionGameId) }
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual section game card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SectionGameCard(
    game: SectionGameWithGame,
    position: Int,
    totalCount: Int,
    isRemoving: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onRemove: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                color = GamerBhiduAdminTheme.colors.surface,
                shape = RoundedCornerShape(12.dp)
            )
            .border(
                width = 1.dp,
                color = GamerBhiduAdminTheme.colors.borderSubtle,
                shape = RoundedCornerShape(12.dp)
            )
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Position badge
        Box(
            modifier = Modifier
                .size(28.dp)
                .background(
                    GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.12f),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "$position",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = GamerBhiduAdminTheme.colors.primary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
            )
        }

        // Thumbnail
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
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(44.dp, 58.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(GamerBhiduAdminTheme.colors.surfaceVariant)
        )

        // Info
        Column(modifier = Modifier.weight(1f)) {
            Text(
                game.title,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontWeight = FontWeight.SemiBold
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(Modifier.height(3.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                // Price badge
                game.sellingPrice?.let { price ->
                    Text(
                        "₹${price.toInt()}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.success,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }
                // Status badge
                val statusColor = if (game.releaseStatus == "upcoming")
                    GamerBhiduAdminTheme.colors.statusUpcoming
                else if (!game.visible)
                    GamerBhiduAdminTheme.colors.statusHidden
                else GamerBhiduAdminTheme.colors.statusVisible
                val statusText = when {
                    game.releaseStatus == "upcoming" -> "Upcoming"
                    !game.visible -> "Hidden"
                    else -> "Visible"
                }
                Box(
                    modifier = Modifier
                        .background(
                            statusColor.copy(alpha = 0.12f),
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                    Text(
                        statusText,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = statusColor,
                            fontSize = 10.sp
                        )
                    )
                }
            }
        }

        // Up/Down reorder buttons
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            IconButton(
                onClick = onMoveUp,
                enabled = position > 1 && !isRemoving,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    Icons.Filled.KeyboardArrowUp,
                    contentDescription = "Move up",
                    tint = if (position > 1) GamerBhiduAdminTheme.colors.textSecondary
                           else GamerBhiduAdminTheme.colors.textTertiary,
                    modifier = Modifier.size(18.dp)
                )
            }
            IconButton(
                onClick = onMoveDown,
                enabled = position < totalCount && !isRemoving,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    Icons.Filled.KeyboardArrowDown,
                    contentDescription = "Move down",
                    tint = if (position < totalCount) GamerBhiduAdminTheme.colors.textSecondary
                           else GamerBhiduAdminTheme.colors.textTertiary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Remove button
        if (isRemoving) {
            CircularProgressIndicator(
                modifier = Modifier
                    .size(28.dp)
                    .padding(4.dp),
                color = GamerBhiduAdminTheme.colors.error,
                strokeWidth = 2.dp
            )
        } else {
            IconButton(
                onClick = onRemove,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    Icons.Default.RemoveCircleOutline,
                    contentDescription = "Remove from section",
                    tint = GamerBhiduAdminTheme.colors.error,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Picker Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun GamePickerBottomSheet(
    games: List<Game>,
    query: String,
    onQueryChange: (String) -> Unit,
    onSelectGame: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = GamerBhiduAdminTheme.colors.surface,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 12.dp, bottom = 4.dp)
                    .size(width = 40.dp, height = 4.dp)
                    .background(
                        GamerBhiduAdminTheme.colors.borderLight,
                        RoundedCornerShape(2.dp)
                    )
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "Add Game to Section",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = GamerBhiduAdminTheme.colors.textPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Text(
                        "${games.size} available",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textSecondary
                        )
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = GamerBhiduAdminTheme.colors.textSecondary
                    )
                }
            }

            // Search field
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = {
                    Text(
                        "Search games...",
                        color = GamerBhiduAdminTheme.colors.textTertiary
                    )
                },
                leadingIcon = {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = null,
                        tint = GamerBhiduAdminTheme.colors.textSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                    unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                    cursorColor = GamerBhiduAdminTheme.colors.primary,
                    focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                    unfocusedBorderColor = GamerBhiduAdminTheme.colors.borderSubtle,
                    focusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f),
                    unfocusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.25f)
                ),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search)
            )

            Spacer(Modifier.height(4.dp))

            // Games list
            if (games.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        if (query.isNotBlank()) "No games match \"$query\""
                        else "All visible games are already in this section",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textSecondary
                        )
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(games) { game ->
                        PickerGameRow(game = game, onClick = { onSelectGame(game.id!!) })
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

@Composable
private fun PickerGameRow(game: Game, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.4f))
            .clickable(onClick = onClick)
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
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
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(38.dp, 50.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(GamerBhiduAdminTheme.colors.surface)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                game.title,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontWeight = FontWeight.Medium
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            game.sellingPrice?.let {
                Text(
                    "₹${it.toInt()}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = GamerBhiduAdminTheme.colors.textSecondary
                    )
                )
            }
        }
        Icon(
            Icons.Default.Add,
            contentDescription = "Add",
            tint = GamerBhiduAdminTheme.colors.primary,
            modifier = Modifier.size(18.dp)
        )
    }
}
