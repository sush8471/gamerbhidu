package com.gamerbhidu.admin.ui.screens.editor

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.BrokenImage
import androidx.compose.material.icons.outlined.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.compose.SubcomposeAsyncImage
import com.gamerbhidu.admin.ui.screens.login.AdminInputField
import com.gamerbhidu.admin.ui.theme.*
import com.gamerbhidu.admin.util.ToastUtils
import com.gamerbhidu.admin.util.resolveImageUrl

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameEditorScreen(
    gameId: String?,
    onNavigateBack: () -> Unit,
    onSaved: () -> Unit,
    viewModel: GameEditorViewModel = viewModel(factory = GameEditorViewModel.Factory(gameId))
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(uiState.isSaved) {
        if (uiState.isSaved) {
            ToastUtils.showSuccess(
                context,
                if (uiState.isEditMode) "Game updated successfully!" else "Game added successfully!"
            )
            onSaved()
        }
    }

    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            ToastUtils.showError(context, it)
        }
    }

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { viewModel.uploadImage(context, it) }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            if (uiState.isEditMode) "Edit Game" else "Add Game",
                            style = MaterialTheme.typography.titleMedium.copy(
                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                },
                navigationIcon = {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .background(
                                color = GamerBhiduAdminTheme.colors.surfaceVariant,
                                shape = CircleShape
                            )
                            .border(
                                width = 1.dp,
                                color = GamerBhiduAdminTheme.colors.borderSubtle,
                                shape = CircleShape
                            )
                            .clickable { onNavigateBack() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = GamerBhiduAdminTheme.colors.textSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                },
                actions = {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(GamerBhiduAdminTheme.colors.primary)
                            .clickable(enabled = !uiState.isLoading) { viewModel.save() }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                "Save",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = GamerBhiduAdminTheme.colors.surface.copy(alpha = 0.95f)
                )
            )
        },
        containerColor = GamerBhiduAdminTheme.colors.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            if (uiState.isLoading && !uiState.isEditMode) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = GamerBhiduAdminTheme.colors.primary,
                        strokeWidth = 3.dp
                    )
                }
            } else {
                // Error Banner
                uiState.error?.let { error ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                color = GamerBhiduAdminTheme.colors.errorSubtle,
                                shape = RoundedCornerShape(14.dp)
                            )
                            .border(
                                width = 1.dp,
                                color = GamerBhiduAdminTheme.colors.error.copy(alpha = 0.4f),
                                shape = RoundedCornerShape(14.dp)
                            )
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = null,
                            tint = GamerBhiduAdminTheme.colors.error,
                            modifier = Modifier.size(18.dp)
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
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                // ── SECTION: Steam Autofill ───────────────────────────────────
                EpicEditorSection(
                    title = "STEAM AUTOFILL",
                    icon = Icons.Default.Games
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.Bottom
                    ) {
                        AdminInputField(
                            value = uiState.steamAppId,
                            onValueChange = viewModel::onSteamAppIdChange,
                            label = "STEAM APP ID",
                            placeholder = "e.g. 570",
                            leadingIcon = Icons.Default.Games,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number,
                                imeAction = ImeAction.Done
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        
                        Box(
                            modifier = Modifier
                                .height(56.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    if (uiState.steamAppId.isNotBlank())
                                        GamerBhiduAdminTheme.colors.primary
                                    else
                                        GamerBhiduAdminTheme.colors.surfaceVariant
                                )
                                .clickable(
                                    enabled = !uiState.isFetchingSteam && uiState.steamAppId.isNotBlank()
                                ) { viewModel.fetchSteamDetails() }
                                .padding(horizontal = 20.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            if (uiState.isFetchingSteam) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(18.dp),
                                    color = if (uiState.steamAppId.isNotBlank()) Color.Black else Color.White,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    "Fetch",
                                    color = if (uiState.steamAppId.isNotBlank()) Color.Black else GamerBhiduAdminTheme.colors.textTertiary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                    Text(
                        "Enter the Steam App ID to auto-fill title, genres, description & poster.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary
                        )
                    )
                }

                // ── SECTION: Game Image ──────────────────────────────────────
                EpicEditorSection(
                    title = "GAME POSTER",
                    icon = Icons.Default.Image
                ) {
                    // Live Poster Preview Box
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f))
                            .border(
                                width = 1.dp,
                                color = if (uiState.imageUrl.isNotBlank()) GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.4f)
                                else GamerBhiduAdminTheme.colors.borderLight,
                                shape = RoundedCornerShape(16.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (uiState.imageUrl.isNotBlank()) {
                            SubcomposeAsyncImage(
                                model = resolveImageUrl(uiState.imageUrl),
                                contentDescription = "Game poster preview",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop,
                                loading = {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(28.dp),
                                            color = GamerBhiduAdminTheme.colors.primary,
                                            strokeWidth = 2.5.dp
                                        )
                                    }
                                },
                                error = {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .padding(16.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center
                                    ) {
                                        Icon(
                                            Icons.Outlined.BrokenImage,
                                            contentDescription = "Image Error",
                                            tint = GamerBhiduAdminTheme.colors.error,
                                            modifier = Modifier.size(36.dp)
                                        )
                                        Spacer(Modifier.height(6.dp))
                                        Text(
                                            "Failed to load image preview",
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                color = GamerBhiduAdminTheme.colors.error,
                                                fontWeight = FontWeight.Medium
                                            )
                                        )
                                        Text(
                                            "Check the URL or pick another image",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                color = GamerBhiduAdminTheme.colors.textTertiary,
                                                fontSize = 11.sp
                                            )
                                        )
                                    }
                                }
                            )

                            // Top overlay: Live Preview pill badge & Clear action
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .align(Alignment.TopStart)
                                    .padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .background(Color.Black.copy(alpha = 0.75f), RoundedCornerShape(20.dp))
                                        .border(1.dp, GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                                        .padding(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .background(Color(0xFF22C55E), CircleShape)
                                        )
                                        Text(
                                            "Live Preview",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                color = Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 10.sp
                                            )
                                        )
                                    }
                                }

                                Box(
                                    modifier = Modifier
                                        .background(Color.Black.copy(alpha = 0.75f), CircleShape)
                                        .clickable { viewModel.onImageUrlChange("") }
                                        .padding(6.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Clear Image",
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        } else {
                            // Empty State Placeholder
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .background(GamerBhiduAdminTheme.colors.surfaceVariant, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Outlined.PhotoLibrary,
                                        contentDescription = null,
                                        tint = GamerBhiduAdminTheme.colors.textTertiary,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                Text(
                                    "No Poster Selected",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = GamerBhiduAdminTheme.colors.textSecondary,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                )
                                Text(
                                    "Paste an image URL below or upload from device",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = GamerBhiduAdminTheme.colors.textTertiary,
                                        fontSize = 11.sp
                                    )
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))

                    AdminInputField(
                        value = uiState.imageUrl,
                        onValueChange = viewModel::onImageUrlChange,
                        label = "IMAGE URL",
                        placeholder = "https://... or upload below",
                        leadingIcon = Icons.Default.Link,
                        trailingIcon = {
                            if (uiState.imageUrl.isNotBlank()) {
                                IconButton(onClick = { viewModel.onImageUrlChange("") }) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Clear URL",
                                        tint = GamerBhiduAdminTheme.colors.textSecondary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Uri,
                            imeAction = ImeAction.Done
                        )
                    )
                    
                    // Epic Upload Button
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(GamerBhiduAdminTheme.colors.surfaceVariant)
                            .border(
                                width = 1.dp,
                                color = GamerBhiduAdminTheme.colors.borderLight,
                                shape = RoundedCornerShape(14.dp)
                            )
                            .clickable(enabled = !uiState.isUploadingImage) {
                                imagePicker.launch("image/*")
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            if (uiState.isUploadingImage) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = GamerBhiduAdminTheme.colors.primary,
                                    strokeWidth = 2.dp
                                )
                                Text(
                                    "Uploading…",
                                    color = GamerBhiduAdminTheme.colors.textSecondary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            } else {
                                Icon(
                                    Icons.Default.Upload,
                                    contentDescription = null,
                                    tint = GamerBhiduAdminTheme.colors.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    "Upload from Device",
                                    color = GamerBhiduAdminTheme.colors.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // ── SECTION: Basic Info ──────────────────────────────────────
                EpicEditorSection(
                    title = "BASIC INFORMATION",
                    icon = Icons.Default.Info
                ) {
                    AdminInputField(
                        value = uiState.title,
                        onValueChange = viewModel::onTitleChange,
                        label = "TITLE *",
                        placeholder = "e.g. Dota 2",
                        leadingIcon = Icons.Default.Title,
                        keyboardOptions = KeyboardOptions(
                            capitalization = KeyboardCapitalization.Words,
                            imeAction = ImeAction.Next
                        )
                    )
                    Spacer(Modifier.height(4.dp))
                    AdminInputField(
                        value = uiState.slug,
                        onValueChange = viewModel::onSlugChange,
                        label = "SLUG *",
                        placeholder = "e.g. dota-2",
                        leadingIcon = Icons.Default.Link,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                    )
                    Text(
                        "Lowercase letters, numbers, hyphens, underscores only.",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary
                        )
                    )
                    Spacer(Modifier.height(4.dp))
                    AdminInputField(
                        value = uiState.genre,
                        onValueChange = viewModel::onGenreChange,
                        label = "GENRE(S) * — comma separated",
                        placeholder = "e.g. Action, RPG, Strategy",
                        leadingIcon = Icons.Default.Category,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                    )
                    Spacer(Modifier.height(4.dp))
                    AdminInputField(
                        value = uiState.series,
                        onValueChange = viewModel::onSeriesChange,
                        label = "SERIES (optional)",
                        placeholder = "e.g. Half-Life",
                        leadingIcon = Icons.Default.Collections,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                    )
                }

                // ── SECTION: Pricing ──────────────────────────────────────────
                EpicEditorSection(
                    title = "PRICING",
                    icon = Icons.Default.CurrencyRupee
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        AdminInputField(
                            value = uiState.sellingPrice,
                            onValueChange = viewModel::onSellingPriceChange,
                            label = "SELLING PRICE",
                            placeholder = "e.g. 299",
                            leadingIcon = Icons.Default.CurrencyRupee,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Decimal,
                                imeAction = ImeAction.Next
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        AdminInputField(
                            value = uiState.originalPrice,
                            onValueChange = viewModel::onOriginalPriceChange,
                            label = "ORIGINAL PRICE",
                            placeholder = "e.g. 599",
                            leadingIcon = Icons.Default.PriceChange,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Decimal,
                                imeAction = ImeAction.Next
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    
                    if (uiState.discountPercentage.isNotBlank()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    color = GamerBhiduAdminTheme.colors.successSubtle,
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .border(
                                    width = 1.dp,
                                    color = GamerBhiduAdminTheme.colors.success.copy(alpha = 0.3f),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.LocalOffer,
                                contentDescription = null,
                                tint = GamerBhiduAdminTheme.colors.success,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                "${uiState.discountPercentage}% discount auto-calculated",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = GamerBhiduAdminTheme.colors.success,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }

                // ── SECTION: Status ───────────────────────────────────────────
                EpicEditorSection(
                    title = "STATUS & VISIBILITY",
                    icon = Icons.Default.ToggleOn
                ) {
                    Text(
                        "RELEASE STATUS",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary,
                            letterSpacing = 2.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(Modifier.height(10.dp))
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        listOf(
                            "released" to GamerBhiduAdminTheme.colors.primary,
                            "upcoming" to GamerBhiduAdminTheme.colors.secondary
                        ).forEach { (status, color) ->
                            val isSelected = uiState.releaseStatus == status
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        color = if (isSelected) color.copy(alpha = 0.15f)
                                        else GamerBhiduAdminTheme.colors.surfaceVariant
                                    )
                                    .border(
                                        width = if (isSelected) 2.dp else 1.dp,
                                        color = if (isSelected) color.copy(alpha = 0.5f)
                                        else GamerBhiduAdminTheme.colors.border,
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable { viewModel.onReleaseStatusChange(status) }
                                    .padding(vertical = 14.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    status.replaceFirstChar { it.uppercase() },
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        color = if (isSelected) color
                                        else GamerBhiduAdminTheme.colors.textSecondary,
                                        fontWeight = if (isSelected) FontWeight.Black
                                        else FontWeight.Normal,
                                        letterSpacing = 1.sp
                                    )
                                )
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    // Epic Visibility Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(GamerBhiduAdminTheme.colors.surfaceVariant)
                            .border(
                                width = 1.dp,
                                color = GamerBhiduAdminTheme.colors.border,
                                shape = RoundedCornerShape(14.dp)
                            )
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                "Visible on Website",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    color = GamerBhiduAdminTheme.colors.textPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Text(
                                if (uiState.visible) "Game is publicly visible"
                                else "Game is hidden from customers",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = if (uiState.visible)
                                        GamerBhiduAdminTheme.colors.success
                                    else GamerBhiduAdminTheme.colors.warning
                                )
                            )
                        }
                        Switch(
                            checked = uiState.visible,
                            onCheckedChange = viewModel::onVisibleChange,
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = GamerBhiduAdminTheme.colors.success,
                                uncheckedThumbColor = Color.White,
                                uncheckedTrackColor = GamerBhiduAdminTheme.colors.surfaceVariant
                            )
                        )
                    }
                }

                // ── SECTION: Description ──────────────────────────────────────
                EpicEditorSection(
                    title = "DESCRIPTION",
                    icon = Icons.Default.Description
                ) {
                    OutlinedTextField(
                        value = uiState.description,
                        onValueChange = viewModel::onDescriptionChange,
                        placeholder = {
                            Text(
                                "Short description of the game...",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = GamerBhiduAdminTheme.colors.textTertiary
                                )
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp, max = 200.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                            unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                            cursorColor = GamerBhiduAdminTheme.colors.primary,
                            focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                            unfocusedBorderColor = GamerBhiduAdminTheme.colors.border,
                            focusedContainerColor = GamerBhiduAdminTheme.colors.background.copy(alpha = 0.5f),
                            unfocusedContainerColor = GamerBhiduAdminTheme.colors.background.copy(alpha = 0.3f)
                        ),
                        textStyle = MaterialTheme.typography.bodyMedium.copy(
                            color = GamerBhiduAdminTheme.colors.textPrimary
                        ),
                        maxLines = 8
                    )
                }

                // ── Epic Save Button ──────────────────────────────────────────
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(
                                    GamerBhiduAdminTheme.colors.primary,
                                    GamerBhiduAdminTheme.colors.primaryBright
                                )
                            )
                        )
                        .clickable(
                            enabled = !uiState.isLoading && !uiState.isUploadingImage
                        ) { viewModel.save() },
                    contentAlignment = Alignment.Center
                ) {
                    if (uiState.isLoading) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(22.dp),
                                color = Color.Black,
                                strokeWidth = 2.5.dp
                            )
                            Text(
                                "Saving…",
                                color = Color.Black,
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                letterSpacing = 1.sp
                            )
                        }
                    } else {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.Save,
                                contentDescription = null,
                                tint = Color.Black,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                if (uiState.isEditMode) "Save Changes" else "Add to Catalog",
                                color = Color.Black,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// CLEAN FORM SECTION
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun EpicEditorSection(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(GamerBhiduAdminTheme.colors.surface)
            .border(
                width = 1.dp,
                color = GamerBhiduAdminTheme.colors.borderSubtle,
                shape = RoundedCornerShape(14.dp)
            )
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = GamerBhiduAdminTheme.colors.primary,
                modifier = Modifier.size(20.dp)
            )
            Text(
                title,
                style = MaterialTheme.typography.titleSmall.copy(
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontWeight = FontWeight.Bold
                )
            )
        }

        HorizontalDivider(
            color = GamerBhiduAdminTheme.colors.borderSubtle,
            thickness = 1.dp
        )

        content()
    }
}