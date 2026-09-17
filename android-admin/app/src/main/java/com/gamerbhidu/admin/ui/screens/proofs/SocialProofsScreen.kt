package com.gamerbhidu.admin.ui.screens.proofs

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.PhotoLibrary
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.gamerbhidu.admin.data.model.SocialProof
import com.gamerbhidu.admin.ui.components.SocialProofsSkeleton
import com.gamerbhidu.admin.ui.theme.GamerBhiduAdminTheme
import com.gamerbhidu.admin.util.resolveImageUrl

private val PRESET_TAGS = listOf("Order Delivered", "Verified Deal", "Epic Deal")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialProofsScreen(
    onNavigateBack: () -> Unit,
    viewModel: SocialProofsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { viewModel.uploadProofImage(context, it) }
    }

    val filteredProofs = remember(uiState.proofs, uiState.searchQuery) {
        if (uiState.searchQuery.isBlank()) uiState.proofs
        else {
            val q = uiState.searchQuery.trim().lowercase()
            uiState.proofs.filter {
                (it.label?.lowercase()?.contains(q) == true) ||
                it.tag.lowercase().contains(q)
            }
        }
    }

    // ── Delete Confirmation Dialog ───────────────────────────────────────────
    uiState.deleteConfirmProof?.let { proof ->
        AlertDialog(
            onDismissRequest = viewModel::cancelDelete,
            title = {
                Text(
                    "Delete Proof?",
                    color = GamerBhiduAdminTheme.colors.textPrimary,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "Delete \"${proof.label ?: "this social proof"}\"? This proof will be permanently removed from the website.",
                        color = GamerBhiduAdminTheme.colors.textSecondary,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { viewModel.confirmDelete(context) }) {
                    Text(
                        "Delete",
                        color = GamerBhiduAdminTheme.colors.error,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = viewModel::cancelDelete) {
                    Text(
                        "Cancel",
                        color = GamerBhiduAdminTheme.colors.textSecondary
                    )
                }
            },
            containerColor = GamerBhiduAdminTheme.colors.surface,
            shape = RoundedCornerShape(20.dp)
        )
    }

    // ── Add Proof Bottom Sheet ───────────────────────────────────────────────
    if (uiState.isAddDialogOpen) {
        ModalBottomSheet(
            onDismissRequest = viewModel::closeAddDialog,
            containerColor = GamerBhiduAdminTheme.colors.surface,
            dragHandle = {
                Box(
                    modifier = Modifier
                        .padding(top = 12.dp, bottom = 6.dp)
                        .size(width = 38.dp, height = 4.dp)
                        .background(GamerBhiduAdminTheme.colors.borderSubtle, RoundedCornerShape(2.dp))
                )
            }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .navigationBarsPadding()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Sheet Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Add Social Proof",
                            style = MaterialTheme.typography.titleMedium.copy(
                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            "High-quality proof screenshot for homepage",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = GamerBhiduAdminTheme.colors.textSecondary,
                                fontSize = 12.sp
                            )
                        )
                    }
                    IconButton(onClick = viewModel::closeAddDialog) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Close",
                            tint = GamerBhiduAdminTheme.colors.textSecondary
                        )
                    }
                }

                // Error message
                uiState.formError?.let { err ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                color = GamerBhiduAdminTheme.colors.errorSubtle,
                                shape = RoundedCornerShape(10.dp)
                            )
                            .border(
                                1.dp,
                                GamerBhiduAdminTheme.colors.error.copy(alpha = 0.3f),
                                RoundedCornerShape(10.dp)
                            )
                            .padding(10.dp),
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
                                color = GamerBhiduAdminTheme.colors.error,
                                fontSize = 12.sp
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // ── Image Upload Picker ───────────────────────────────────────
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "SCREENSHOT / IMAGE *",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f))
                            .border(
                                1.5.dp,
                                if (uiState.formImageUrl.isNotBlank()) GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.5f)
                                else GamerBhiduAdminTheme.colors.borderSubtle,
                                RoundedCornerShape(14.dp)
                            )
                            .clickable(enabled = !uiState.isUploadingImage) {
                                imagePicker.launch("image/*")
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        when {
                            uiState.isUploadingImage -> {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(28.dp),
                                        color = GamerBhiduAdminTheme.colors.primary,
                                        strokeWidth = 2.5.dp
                                    )
                                    Text(
                                        "Optimizing & uploading image...",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = GamerBhiduAdminTheme.colors.textSecondary,
                                            fontWeight = FontWeight.Medium
                                        )
                                    )
                                    Text(
                                        "Preserving crisp receipt text (lossless)",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            color = GamerBhiduAdminTheme.colors.textTertiary,
                                            fontSize = 10.sp
                                        )
                                    )
                                }
                            }
                            uiState.formImageUrl.isNotBlank() -> {
                                Box(modifier = Modifier.fillMaxSize()) {
                                    AsyncImage(
                                        model = resolveImageUrl(uiState.formImageUrl) ?: uiState.formImageUrl,
                                        contentDescription = "Preview",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                    Box(
                                        modifier = Modifier
                                            .align(Alignment.BottomEnd)
                                            .padding(8.dp)
                                            .background(
                                                color = Color.Black.copy(alpha = 0.75f),
                                                shape = RoundedCornerShape(8.dp)
                                            )
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            "Tap to change",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                color = Color.White,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 11.sp
                                            )
                                        )
                                    }
                                }
                            }
                            else -> {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.padding(16.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .background(
                                                color = GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.15f),
                                                shape = CircleShape
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            Icons.Default.FileUpload,
                                            contentDescription = null,
                                            tint = GamerBhiduAdminTheme.colors.primary,
                                            modifier = Modifier.size(22.dp)
                                        )
                                    }
                                    Text(
                                        "Tap to pick image from gallery",
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            color = GamerBhiduAdminTheme.colors.textPrimary,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    )
                                    Text(
                                        "Crisp payment receipts & chats without visual loss",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = GamerBhiduAdminTheme.colors.textTertiary,
                                            fontSize = 11.sp
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // Direct URL input fallback
                    OutlinedTextField(
                        value = uiState.formImageUrl,
                        onValueChange = viewModel::setFormImageUrl,
                        placeholder = { Text("Or paste image URL...", fontSize = 12.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            unfocusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                            unfocusedBorderColor = GamerBhiduAdminTheme.colors.borderSubtle,
                            focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                            unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // ── Label Input ──────────────────────────────────────────────
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "LABEL *",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    )
                    OutlinedTextField(
                        value = uiState.formLabel,
                        onValueChange = viewModel::setFormLabel,
                        placeholder = { Text("e.g. Cyberpunk & Mafia Deal", fontSize = 13.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            unfocusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                            unfocusedBorderColor = GamerBhiduAdminTheme.colors.borderSubtle,
                            focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                            unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // ── Tag Selector ─────────────────────────────────────────────
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        "TAG",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    )

                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        PRESET_TAGS.forEach { tagOption ->
                            val isSelected = uiState.formTag.equals(tagOption, ignoreCase = true)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        if (isSelected) GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.2f)
                                        else GamerBhiduAdminTheme.colors.surfaceVariant
                                    )
                                    .border(
                                        1.dp,
                                        if (isSelected) GamerBhiduAdminTheme.colors.primary else GamerBhiduAdminTheme.colors.borderSubtle,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { viewModel.setFormTag(tagOption) }
                                    .padding(horizontal = 12.dp, vertical = 7.dp)
                            ) {
                                Text(
                                    tagOption,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = if (isSelected) GamerBhiduAdminTheme.colors.primary else GamerBhiduAdminTheme.colors.textSecondary,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        fontSize = 11.sp
                                    )
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = uiState.formTag,
                        onValueChange = viewModel::setFormTag,
                        placeholder = { Text("Or enter custom tag...", fontSize = 12.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            unfocusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.3f),
                            focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                            unfocusedBorderColor = GamerBhiduAdminTheme.colors.borderSubtle,
                            focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                            unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // ── Visibility Switch ────────────────────────────────────────
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.4f),
                            RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Visible on Homepage",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = GamerBhiduAdminTheme.colors.textPrimary,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                        Text(
                            "Show immediately on customer storefront",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = GamerBhiduAdminTheme.colors.textTertiary,
                                fontSize = 11.sp
                            )
                        )
                    }
                    Switch(
                        checked = uiState.formVisible,
                        onCheckedChange = viewModel::setFormVisible,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = GamerBhiduAdminTheme.colors.success,
                            uncheckedThumbColor = GamerBhiduAdminTheme.colors.textSecondary,
                            uncheckedTrackColor = GamerBhiduAdminTheme.colors.surfaceVariant
                        )
                    )
                }

                // ── Action Buttons ───────────────────────────────────────────
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp, bottom = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = viewModel::closeAddDialog,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel", color = GamerBhiduAdminTheme.colors.textSecondary)
                    }

                    Button(
                        onClick = { viewModel.saveNewProof(context) },
                        enabled = !uiState.isSaving && !uiState.isUploadingImage,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = GamerBhiduAdminTheme.colors.primary,
                            contentColor = Color.Black
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        if (uiState.isSaving) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.Black,
                                strokeWidth = 2.dp
                            )
                            Spacer(Modifier.width(8.dp))
                            Text("Saving...")
                        } else {
                            Text("Add Proof", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    // ── Main Screen Layout ───────────────────────────────────────────────────
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
            containerColor = Color.Transparent,
            contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // ── Header ───────────────────────────────────────────────────
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = GamerBhiduAdminTheme.colors.surface.copy(alpha = 0.95f),
                    tonalElevation = 0.dp
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .statusBarsPadding()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Back Button
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

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    "MARKETING",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = GamerBhiduAdminTheme.colors.textTertiary,
                                        letterSpacing = 1.5.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        "Social Proofs",
                                        style = MaterialTheme.typography.titleMedium.copy(
                                            color = GamerBhiduAdminTheme.colors.textPrimary,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                    if (!uiState.isLoading) {
                                        Box(
                                            modifier = Modifier
                                                .background(
                                                    GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.15f),
                                                    RoundedCornerShape(6.dp)
                                                )
                                                .padding(horizontal = 6.dp, vertical = 1.dp)
                                        ) {
                                            Text(
                                                "${uiState.proofs.size}",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    color = GamerBhiduAdminTheme.colors.primary,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 10.sp
                                                )
                                            )
                                        }
                                    }
                                }
                            }

                            // Add Proof Button
                            Button(
                                onClick = viewModel::openAddDialog,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = GamerBhiduAdminTheme.colors.primary,
                                    contentColor = Color.Black
                                ),
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier.height(36.dp)
                            ) {
                                Icon(
                                    Icons.Default.Add,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(
                                    "Add",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                                )
                            }

                            // Refresh Button
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
                                    .clickable { viewModel.loadProofs() },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.Refresh,
                                    contentDescription = "Refresh",
                                    tint = GamerBhiduAdminTheme.colors.textSecondary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        // Search Bar
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedTextField(
                                value = uiState.searchQuery,
                                onValueChange = viewModel::setSearchQuery,
                                placeholder = {
                                    Text(
                                        "Search by label or tag...",
                                        fontSize = 13.sp,
                                        color = GamerBhiduAdminTheme.colors.textTertiary
                                    )
                                },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.Search,
                                        contentDescription = "Search",
                                        tint = GamerBhiduAdminTheme.colors.textSecondary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                },
                                trailingIcon = {
                                    if (uiState.searchQuery.isNotBlank()) {
                                        IconButton(onClick = { viewModel.setSearchQuery("") }) {
                                            Icon(
                                                Icons.Default.Close,
                                                contentDescription = "Clear",
                                                tint = GamerBhiduAdminTheme.colors.textSecondary,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                },
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f),
                                    unfocusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f),
                                    focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                                    unfocusedBorderColor = GamerBhiduAdminTheme.colors.borderSubtle,
                                    focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                                    unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        // Bottom border line
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(GamerBhiduAdminTheme.colors.borderSubtle)
                        )
                    }
                }

                // ── Body Content ─────────────────────────────────────────────
                Column(modifier = Modifier.fillMaxSize()) {
                    uiState.error?.let { error ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
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
                            verticalAlignment = Alignment.CenterVertically
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
                                    color = GamerBhiduAdminTheme.colors.error,
                                    fontWeight = FontWeight.Medium
                                ),
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(
                                onClick = viewModel::clearError,
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    Icons.Default.Close,
                                    contentDescription = "Dismiss",
                                    tint = GamerBhiduAdminTheme.colors.error,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    }

                    PullToRefreshBox(
                        isRefreshing = uiState.isRefreshing,
                        onRefresh = viewModel::refresh,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        when {
                            uiState.isLoading -> {
                                SocialProofsSkeleton()
                            }
                            filteredProofs.isEmpty() -> {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(24.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(
                                                color = GamerBhiduAdminTheme.colors.surface,
                                                shape = RoundedCornerShape(14.dp)
                                            )
                                            .border(
                                                width = 1.dp,
                                                color = GamerBhiduAdminTheme.colors.borderSubtle,
                                                shape = RoundedCornerShape(14.dp)
                                            )
                                            .padding(32.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(52.dp)
                                                    .background(
                                                        color = GamerBhiduAdminTheme.colors.surfaceVariant,
                                                        shape = CircleShape
                                                    ),
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
                                                if (uiState.searchQuery.isNotBlank()) "No proofs match \"${uiState.searchQuery}\""
                                                else "No social proofs found",
                                                style = MaterialTheme.typography.bodyMedium.copy(
                                                    color = GamerBhiduAdminTheme.colors.textSecondary,
                                                    fontWeight = FontWeight.SemiBold
                                                )
                                            )
                                            Text(
                                                if (uiState.searchQuery.isNotBlank()) "Try another search term"
                                                else "Upload a payment proof screenshot to display on your storefront",
                                                style = MaterialTheme.typography.bodySmall.copy(
                                                    color = GamerBhiduAdminTheme.colors.textTertiary
                                                )
                                            )
                                            if (uiState.searchQuery.isBlank()) {
                                                Button(
                                                    onClick = viewModel::openAddDialog,
                                                    colors = ButtonDefaults.buttonColors(
                                                        containerColor = GamerBhiduAdminTheme.colors.primary,
                                                        contentColor = Color.Black
                                                    ),
                                                    shape = RoundedCornerShape(10.dp),
                                                    modifier = Modifier.padding(top = 4.dp)
                                                ) {
                                                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                                    Spacer(Modifier.width(6.dp))
                                                    Text("Add Proof", fontWeight = FontWeight.Bold)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else -> {
                                LazyColumn(
                                    contentPadding = PaddingValues(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(10.dp),
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    items(filteredProofs, key = { it.id ?: it.imageUrl }) { proof ->
                                        EpicSocialProofCard(
                                            proof = proof,
                                            isDeleting = uiState.isDeletingId == proof.id,
                                            isTogglingVisibility = uiState.togglingVisibilityId == proof.id,
                                            onToggleVisibility = { viewModel.toggleVisibility(proof, context) },
                                            onDelete = { viewModel.requestDelete(proof) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EpicSocialProofCard(
    proof: SocialProof,
    isDeleting: Boolean,
    isTogglingVisibility: Boolean,
    onToggleVisibility: () -> Unit,
    onDelete: () -> Unit
) {
    val resolvedUrl = remember(proof.imageUrl) { resolveImageUrl(proof.imageUrl) ?: proof.imageUrl }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                color = GamerBhiduAdminTheme.colors.surface,
                shape = RoundedCornerShape(12.dp)
            )
            .border(
                width = 1.dp,
                color = if (proof.visible) GamerBhiduAdminTheme.colors.borderSubtle
                else GamerBhiduAdminTheme.colors.borderSubtle.copy(alpha = 0.5f),
                shape = RoundedCornerShape(12.dp)
            )
            .padding(12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Thumbnail Image
        AsyncImage(
            model = resolvedUrl,
            contentDescription = proof.label,
            modifier = Modifier
                .size(width = 72.dp, height = 54.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(GamerBhiduAdminTheme.colors.surfaceVariant),
            contentScale = ContentScale.Crop
        )

        // Details
        Column(modifier = Modifier.weight(1f)) {
            Text(
                proof.label ?: "Social Proof #${proof.displayOrder}",
                style = MaterialTheme.typography.titleSmall.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = if (proof.visible) GamerBhiduAdminTheme.colors.textPrimary
                    else GamerBhiduAdminTheme.colors.textSecondary
                ),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(Modifier.height(4.dp))

            // Badges row (Tag + Order #)
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tag badge
                Box(
                    modifier = Modifier
                        .background(
                            color = GamerBhiduAdminTheme.colors.success.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(4.dp)
                        )
                        .border(
                            0.5.dp,
                            GamerBhiduAdminTheme.colors.success.copy(alpha = 0.3f),
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        proof.tag,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.success,
                            fontWeight = FontWeight.Bold,
                            fontSize = 9.5.sp
                        )
                    )
                }

                // Order pill badge
                Box(
                    modifier = Modifier
                        .background(
                            color = GamerBhiduAdminTheme.colors.surfaceVariant,
                            shape = RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        "#${proof.displayOrder}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = GamerBhiduAdminTheme.colors.textTertiary,
                            fontWeight = FontWeight.Medium,
                            fontSize = 9.5.sp
                        )
                    )
                }
            }
        }

        // ── Action Buttons (Visibility Toggle + Delete) ───────────────────────
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Visibility Toggle Button
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(
                        color = if (proof.visible) GamerBhiduAdminTheme.colors.success.copy(alpha = 0.12f)
                        else GamerBhiduAdminTheme.colors.surfaceVariant,
                        shape = CircleShape
                    )
                    .border(
                        0.5.dp,
                        if (proof.visible) GamerBhiduAdminTheme.colors.success.copy(alpha = 0.3f)
                        else GamerBhiduAdminTheme.colors.borderSubtle,
                        CircleShape
                    )
                    .clip(CircleShape)
                    .clickable(enabled = !isTogglingVisibility, onClick = onToggleVisibility),
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
                        imageVector = if (proof.visible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                        contentDescription = if (proof.visible) "Visible - Tap to hide" else "Hidden - Tap to show",
                        tint = if (proof.visible) GamerBhiduAdminTheme.colors.success else GamerBhiduAdminTheme.colors.textTertiary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Delete action button
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(
                        color = GamerBhiduAdminTheme.colors.surfaceVariant,
                        shape = CircleShape
                    )
                    .clip(CircleShape)
                    .clickable(enabled = !isDeleting, onClick = onDelete),
                contentAlignment = Alignment.Center
            ) {
                if (isDeleting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = GamerBhiduAdminTheme.colors.error,
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        Icons.Default.DeleteOutline,
                        contentDescription = "Delete",
                        tint = GamerBhiduAdminTheme.colors.textSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
