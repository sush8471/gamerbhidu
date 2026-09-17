package com.gamerbhidu.admin.ui.screens.combos

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.platform.LocalContext
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.gamerbhidu.admin.data.model.ComboGameDetail
import com.gamerbhidu.admin.data.model.ComboWithGames
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.ui.theme.GamerBhiduAdminTheme
import com.gamerbhidu.admin.util.resolveImageUrl
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CombosScreen(
    onNavigateBack: () -> Unit,
    viewModel: CombosViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // ── Delete confirmation dialog ───────────────────────────────────────────
    if (uiState.deleteTargetId != null) {
        AlertDialog(
            onDismissRequest = viewModel::cancelDelete,
            title = {
                Text(
                    "Delete Combo?",
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    "This bundle deal will be permanently deleted and removed from the website.",
                    color = GamerBhiduAdminTheme.colors.textSecondary
                )
            },
            confirmButton = {
                TextButton(onClick = viewModel::confirmDelete) {
                    Text("Delete", color = GamerBhiduAdminTheme.colors.error, fontWeight = FontWeight.Bold)
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

    // ── Add/Edit bottom sheet ────────────────────────────────────────────────
    if (uiState.sheetMode != CombosUiState.SheetMode.NONE) {
        ComboFormSheet(
            uiState = uiState,
            onFormChange = viewModel::onFormChange,
            onSave = viewModel::save,
            onDismiss = viewModel::closeSheet,
            onOpenPicker = viewModel::openPicker,
            onRemoveGame = viewModel::removeGameFromCombo
        )
    }

    // ── Game picker sheet ────────────────────────────────────────────────────
    if (uiState.isPickerOpen) {
        ComboGamePickerSheet(
            games = uiState.pickerGames,
            query = uiState.pickerQuery,
            onQueryChange = viewModel::onPickerQueryChange,
            onSelectGame = viewModel::addGameToCombo,
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
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                "Combos",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = GamerBhiduAdminTheme.colors.textPrimary
                                )
                            )
                            if (!uiState.isLoading) {
                                Box(
                                    modifier = Modifier
                                        .background(
                                            GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.15f),
                                            RoundedCornerShape(8.dp)
                                        )
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        "${uiState.combos.size}",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = GamerBhiduAdminTheme.colors.primary,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                        }
                        Text(
                            "Bundle deals shown on the homepage",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = GamerBhiduAdminTheme.colors.textSecondary
                            )
                        )
                    }
                    IconButton(onClick = viewModel::refresh, enabled = !uiState.isLoading) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = GamerBhiduAdminTheme.colors.textSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // ── Body ─────────────────────────────────────────────────────────
            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        color = GamerBhiduAdminTheme.colors.primary,
                        modifier = Modifier.size(32.dp),
                        strokeWidth = 2.dp
                    )
                }
            } else if (uiState.combos.isEmpty()) {
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
                                .size(72.dp)
                                .background(
                                    GamerBhiduAdminTheme.colors.surface,
                                    RoundedCornerShape(20.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Layers,
                                contentDescription = null,
                                tint = GamerBhiduAdminTheme.colors.textTertiary,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Text(
                            "No combos yet",
                            style = MaterialTheme.typography.bodyLarge.copy(
                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                        Text(
                            "Create your first bundle deal to display on the Value Combos section of the homepage.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = GamerBhiduAdminTheme.colors.textSecondary
                            ),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(
                        start = 16.dp,
                        end = 16.dp,
                        top = 12.dp,
                        bottom = 100.dp
                    ),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(uiState.combos, key = { it.combo.id ?: it.combo.title }) { comboWithGames ->
                        ComboCard(
                            comboWithGames = comboWithGames,
                            isToggling = uiState.togglingId == comboWithGames.combo.id,
                            onToggleVisibility = { viewModel.toggleVisibility(comboWithGames.combo) },
                            onEdit = {
                                viewModel.loadComboGames(comboWithGames.combo.id!!)
                                viewModel.openEditSheet(comboWithGames)
                            },
                            onDelete = { viewModel.requestDelete(comboWithGames.combo.id!!) },
                            onExpand = { viewModel.loadComboGames(comboWithGames.combo.id!!) }
                        )
                    }
                }
            }
        }

        // ── FAB ─────────────────────────────────────────────────────────────
        FloatingActionButton(
            onClick = viewModel::openAddSheet,
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
                Icon(Icons.Default.Add, contentDescription = "Add combo", tint = Color.Black, modifier = Modifier.size(20.dp))
                Text(
                    "New Combo",
                    style = MaterialTheme.typography.labelLarge.copy(color = Color.Black, fontWeight = FontWeight.Bold)
                )
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
                LaunchedEffect(err) { viewModel.clearError() }
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = GamerBhiduAdminTheme.colors.errorSubtle)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.Warning, null, tint = GamerBhiduAdminTheme.colors.error, modifier = Modifier.size(16.dp))
                        Text(err, style = MaterialTheme.typography.bodySmall.copy(color = GamerBhiduAdminTheme.colors.error), modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Combo Card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ComboCard(
    comboWithGames: ComboWithGames,
    isToggling: Boolean,
    onToggleVisibility: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onExpand: () -> Unit
) {
    val combo = comboWithGames.combo
    var expanded by remember { mutableStateOf(false) }

    // Compute discount badge
    val discountBadge = run {
        val orig = combo.originalPrice
        val disc = combo.discountedPrice
        if (orig != null && orig > 0 && disc > 0 && disc < orig) {
            val pct = ((orig - disc) / orig * 100).roundToInt()
            if (pct > 0) "-$pct%" else null
        } else null
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(GamerBhiduAdminTheme.colors.surface, RoundedCornerShape(14.dp))
            .border(
                width = 1.dp,
                color = if (combo.visible) GamerBhiduAdminTheme.colors.borderSubtle
                        else GamerBhiduAdminTheme.colors.borderSubtle.copy(alpha = 0.4f),
                shape = RoundedCornerShape(14.dp)
            )
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Thumbnail
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(GamerBhiduAdminTheme.colors.surfaceVariant)
            ) {
                if (!combo.imageUrl.isNullOrBlank()) {
                    val context = LocalContext.current
                    val resolvedUrl = remember(combo.imageUrl) { resolveImageUrl(combo.imageUrl) }
                    val imageRequest = remember(resolvedUrl, context) {
                        ImageRequest.Builder(context)
                            .data(resolvedUrl)
                            .crossfade(true)
                            .size(360, 240)
                            .build()
                    }
                    AsyncImage(
                        model = imageRequest,
                        contentDescription = combo.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.Layers,
                            contentDescription = null,
                            tint = GamerBhiduAdminTheme.colors.textTertiary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }

            // Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    combo.title,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = if (combo.visible) GamerBhiduAdminTheme.colors.textPrimary
                                else GamerBhiduAdminTheme.colors.textSecondary,
                        fontWeight = FontWeight.SemiBold
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(Modifier.height(4.dp))

                // Price row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "₹${combo.discountedPrice.toInt()}",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = GamerBhiduAdminTheme.colors.success,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    combo.originalPrice?.let { orig ->
                        Text(
                            "₹${orig.toInt()}",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = GamerBhiduAdminTheme.colors.textTertiary,
                                fontWeight = FontWeight.Normal
                            )
                        )
                    }
                    discountBadge?.let { badge ->
                        Box(
                            modifier = Modifier
                                .background(
                                    GamerBhiduAdminTheme.colors.success.copy(alpha = 0.12f),
                                    RoundedCornerShape(4.dp)
                                )
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                badge,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = GamerBhiduAdminTheme.colors.success,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }

                Spacer(Modifier.height(4.dp))

                // Visibility + games count badges
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Visibility badge
                    val visColor = if (combo.visible) GamerBhiduAdminTheme.colors.success
                                   else GamerBhiduAdminTheme.colors.warning
                    Box(
                        modifier = Modifier
                            .background(visColor.copy(alpha = 0.12f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 5.dp, vertical = 1.dp)
                    ) {
                        Text(
                            if (combo.visible) "Visible" else "Hidden",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = visColor, fontSize = 10.sp
                            )
                        )
                    }
                    // Expiry badge
                    if (!combo.dealExpiresAt.isNullOrBlank()) {
                        Box(
                            modifier = Modifier
                                .background(
                                    GamerBhiduAdminTheme.colors.warning.copy(alpha = 0.10f),
                                    RoundedCornerShape(4.dp)
                                )
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                "Expires",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = GamerBhiduAdminTheme.colors.warning,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }

                // Curiosity cue
                combo.curiosityCue?.let { cue ->
                    Spacer(Modifier.height(3.dp))
                    Text(
                        cue,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary,
                            fontSize = 10.sp
                        ),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Action buttons column
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                // Visibility toggle
                if (isToggling) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(28.dp).padding(4.dp),
                        color = GamerBhiduAdminTheme.colors.primary,
                        strokeWidth = 2.dp
                    )
                } else {
                    IconButton(onClick = onToggleVisibility, modifier = Modifier.size(36.dp)) {
                        Icon(
                            if (combo.visible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = "Toggle visibility",
                            tint = if (combo.visible) GamerBhiduAdminTheme.colors.success
                                   else GamerBhiduAdminTheme.colors.textTertiary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
                // Edit
                IconButton(onClick = onEdit, modifier = Modifier.size(36.dp)) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = "Edit",
                        tint = GamerBhiduAdminTheme.colors.primary,
                        modifier = Modifier.size(18.dp)
                    )
                }
                // Delete
                IconButton(onClick = onDelete, modifier = Modifier.size(36.dp)) {
                    Icon(
                        Icons.Default.DeleteOutline,
                        contentDescription = "Delete",
                        tint = GamerBhiduAdminTheme.colors.error,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // ── Expand to see games ──────────────────────────────────────────────
        HorizontalDivider(color = GamerBhiduAdminTheme.colors.borderSubtle, thickness = 0.5.dp)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable {
                    expanded = !expanded
                    if (expanded) onExpand()
                }
                .padding(horizontal = 14.dp, vertical = 9.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = GamerBhiduAdminTheme.colors.textTertiary,
                modifier = Modifier.size(16.dp)
            )
            Text(
                if (expanded) "Hide games"
                else "${comboWithGames.games.size.let { if (it > 0) "$it game${if (it != 1) "s" else ""}" else "View games" }}",
                style = MaterialTheme.typography.labelSmall.copy(
                    color = GamerBhiduAdminTheme.colors.textSecondary
                )
            )
        }

        // ── Expanded game list ───────────────────────────────────────────────
        AnimatedVisibility(visible = expanded) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                if (comboWithGames.games.isEmpty()) {
                    Text(
                        "No games added yet",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary
                        ),
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                } else {
                    comboWithGames.games.forEach { game ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
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
                                    .size(32.dp, 42.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(GamerBhiduAdminTheme.colors.surface)
                            )
                            Text(
                                game.title,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = GamerBhiduAdminTheme.colors.textPrimary
                                ),
                                modifier = Modifier.weight(1f),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            game.sellingPrice?.let { price ->
                                Text(
                                    "₹${price.toInt()}",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = GamerBhiduAdminTheme.colors.textSecondary
                                    )
                                )
                            }
                        }
                    }
                }
                Spacer(Modifier.height(4.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Combo Form Bottom Sheet (Add / Edit)
// ─────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ComboFormSheet(
    uiState: CombosUiState,
    onFormChange: (ComboFormState.() -> ComboFormState) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
    onOpenPicker: () -> Unit,
    onRemoveGame: (ComboGameDetail) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val isEditing = uiState.sheetMode == CombosUiState.SheetMode.EDIT
    val form = uiState.form

    // Auto-compute discount %
    val discountPct = form.discountPercent

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = GamerBhiduAdminTheme.colors.surface,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 12.dp, bottom = 4.dp)
                    .size(width = 40.dp, height = 4.dp)
                    .background(GamerBhiduAdminTheme.colors.borderLight, RoundedCornerShape(2.dp))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    if (isEditing) "Edit Combo" else "New Combo",
                    style = MaterialTheme.typography.titleMedium.copy(
                        color = GamerBhiduAdminTheme.colors.textPrimary,
                        fontWeight = FontWeight.Bold
                    ),
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = GamerBhiduAdminTheme.colors.textSecondary)
                }
            }

            // ── Core fields ──────────────────────────────────────────────────

            EpicTextField(
                label = "Title *",
                value = form.title,
                onValueChange = { v -> onFormChange { copy(title = v) } },
                placeholder = "e.g. Epic Action Bundle"
            )

            EpicTextField(
                label = "Description",
                value = form.description,
                onValueChange = { v -> onFormChange { copy(description = v) } },
                placeholder = "Short description of this bundle",
                maxLines = 3
            )

            EpicTextField(
                label = "Curiosity Cue",
                value = form.curiosityCue,
                onValueChange = { v -> onFormChange { copy(curiosityCue = v) } },
                placeholder = "e.g. 🔥 Best bang for your buck!"
            )

            EpicTextField(
                label = "Value Anchor",
                value = form.valueAnchor,
                onValueChange = { v -> onFormChange { copy(valueAnchor = v) } },
                placeholder = "e.g. Worth ₹800, yours for just ₹299"
            )

            EpicTextField(
                label = "Image URL",
                value = form.imageUrl,
                onValueChange = { v -> onFormChange { copy(imageUrl = v) } },
                placeholder = "https://... (optional)"
            )

            // ── Pricing row ──────────────────────────────────────────────────

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                EpicTextField(
                    label = "Original Price (₹)",
                    value = form.originalPrice,
                    onValueChange = { v -> onFormChange { copy(originalPrice = v) } },
                    placeholder = "0",
                    keyboardType = KeyboardType.Decimal,
                    modifier = Modifier.weight(1f)
                )
                EpicTextField(
                    label = "Combo Price (₹) *",
                    value = form.discountedPrice,
                    onValueChange = { v -> onFormChange { copy(discountedPrice = v) } },
                    placeholder = "299",
                    keyboardType = KeyboardType.Decimal,
                    modifier = Modifier.weight(1f)
                )
            }

            // Discount preview
            discountPct?.let { pct ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            GamerBhiduAdminTheme.colors.success.copy(alpha = 0.08f),
                            RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.LocalOffer,
                        contentDescription = null,
                        tint = GamerBhiduAdminTheme.colors.success,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        "Discount badge: -${pct.roundToInt()}%",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.success,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }
            }

            // ── Visibility toggle ────────────────────────────────────────────

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "Visible on website",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textPrimary,
                            fontWeight = FontWeight.Medium
                        )
                    )
                    Text(
                        "Show this combo in the Value Combos section",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textSecondary
                        )
                    )
                }
                Switch(
                    checked = form.visible,
                    onCheckedChange = { v -> onFormChange { copy(visible = v) } },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.Black,
                        checkedTrackColor = GamerBhiduAdminTheme.colors.primary,
                        uncheckedThumbColor = GamerBhiduAdminTheme.colors.textSecondary,
                        uncheckedTrackColor = GamerBhiduAdminTheme.colors.borderSubtle
                    )
                )
            }

            HorizontalDivider(color = GamerBhiduAdminTheme.colors.borderSubtle, thickness = 0.5.dp)

            // ── Games in this combo ──────────────────────────────────────────

            Text(
                "Games in Bundle",
                style = MaterialTheme.typography.labelMedium.copy(
                    color = GamerBhiduAdminTheme.colors.textSecondary,
                    fontWeight = FontWeight.SemiBold
                )
            )

            if (uiState.selectedComboGames.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            RoundedCornerShape(10.dp)
                        )
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "No games added yet. Tap \"Add Game\" below.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary
                        )
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    uiState.selectedComboGames.forEach { game ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
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
                                    .size(32.dp, 42.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(GamerBhiduAdminTheme.colors.surface)
                            )
                            Text(
                                game.title,
                                style = MaterialTheme.typography.bodySmall.copy(color = GamerBhiduAdminTheme.colors.textPrimary),
                                modifier = Modifier.weight(1f),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            game.sellingPrice?.let { p ->
                                Text(
                                    "₹${p.toInt()}",
                                    style = MaterialTheme.typography.labelSmall.copy(color = GamerBhiduAdminTheme.colors.textSecondary)
                                )
                            }
                            IconButton(onClick = { onRemoveGame(game) }, modifier = Modifier.size(28.dp)) {
                                Icon(
                                    Icons.Default.RemoveCircleOutline,
                                    contentDescription = "Remove",
                                    tint = GamerBhiduAdminTheme.colors.error,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Add game button
            OutlinedButton(
                onClick = onOpenPicker,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = GamerBhiduAdminTheme.colors.primary
                ),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.5f)
                )
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Add Game to Bundle", style = MaterialTheme.typography.labelMedium)
            }

            // Error
            uiState.formError?.let { err ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(GamerBhiduAdminTheme.colors.errorSubtle, RoundedCornerShape(8.dp))
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Warning, null, tint = GamerBhiduAdminTheme.colors.error, modifier = Modifier.size(14.dp))
                    Text(err, style = MaterialTheme.typography.labelSmall.copy(color = GamerBhiduAdminTheme.colors.error))
                }
            }

            // Save button
            Button(
                onClick = onSave,
                enabled = !uiState.isSaving && form.isValid,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = GamerBhiduAdminTheme.colors.primary,
                    contentColor = Color.Black,
                    disabledContainerColor = GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.4f),
                    disabledContentColor = Color.Black.copy(alpha = 0.5f)
                )
            ) {
                if (uiState.isSaving) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        color = Color.Black,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        if (isEditing) "Save Changes" else "Create Combo",
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }

            Spacer(Modifier.height(8.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Game picker for combos (separate sheet)
// ─────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ComboGamePickerSheet(
    games: List<Game>,
    query: String,
    onQueryChange: (String) -> Unit,
    onSelectGame: (Game) -> Unit,
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
                    .background(GamerBhiduAdminTheme.colors.borderLight, RoundedCornerShape(2.dp))
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "Add to Bundle",
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
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = GamerBhiduAdminTheme.colors.textSecondary)
                }
            }

            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search games...", color = GamerBhiduAdminTheme.colors.textTertiary) },
                leadingIcon = {
                    Icon(Icons.Default.Search, null, tint = GamerBhiduAdminTheme.colors.textSecondary, modifier = Modifier.size(18.dp))
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
                )
            )

            Spacer(Modifier.height(4.dp))

            if (games.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().height(180.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        if (query.isNotBlank()) "No games match \"$query\""
                        else "All games already in bundle",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textSecondary
                        )
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth().heightIn(max = 420.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(games) { game ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.4f))
                                .clickable { onSelectGame(game) }
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
                                game.sellingPrice?.let { p ->
                                    Text(
                                        "₹${p.toInt()}",
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
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styled text field component
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun EpicTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "",
    maxLines: Int = 1,
    keyboardType: KeyboardType = KeyboardType.Text,
    modifier: Modifier = Modifier.fillMaxWidth()
) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            label,
            style = MaterialTheme.typography.labelSmall.copy(
                color = GamerBhiduAdminTheme.colors.textSecondary,
                fontWeight = FontWeight.Medium
            )
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(placeholder, color = GamerBhiduAdminTheme.colors.textTertiary) },
            singleLine = maxLines == 1,
            maxLines = maxLines,
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
            keyboardOptions = KeyboardOptions(
                keyboardType = keyboardType,
                imeAction = if (maxLines == 1) ImeAction.Next else ImeAction.Default
            )
        )
    }
}
