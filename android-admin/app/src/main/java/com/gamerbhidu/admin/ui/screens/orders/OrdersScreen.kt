package com.gamerbhidu.admin.ui.screens.orders

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import com.gamerbhidu.admin.util.ToastUtils
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.gamerbhidu.admin.data.model.CustomerDossier
import com.gamerbhidu.admin.data.model.Order
import com.gamerbhidu.admin.data.model.OrderItem
import com.gamerbhidu.admin.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    onNavigateBack: () -> Unit,
    viewModel: OrdersViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val keyboardController = LocalSoftwareKeyboardController.current

    val pendingCount = remember(uiState.orders) {
        uiState.orders.count { it.deliveryStatus.equals("pending", ignoreCase = true) }
    }
    val deliveredCount = remember(uiState.orders) {
        uiState.orders.count { it.deliveryStatus.equals("delivered", ignoreCase = true) }
    }

    Scaffold(
        containerColor = BackgroundDeep,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BackgroundDeep)
                    .statusBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }

                    Spacer(Modifier.width(8.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Orders & Verification",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                letterSpacing = (-0.3).sp
                            )
                        )
                        Text(
                            "Manual delivery fulfillment & customer retention",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = TextSecondary,
                                fontSize = 11.sp
                            )
                        )
                    }

                    IconButton(
                        onClick = { viewModel.loadOrders() },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            Icons.Outlined.Refresh,
                            contentDescription = "Refresh",
                            tint = TextSecondary
                        )
                    }
                }
                HorizontalDivider(color = BorderSubtle, thickness = 1.dp)
            }
        }
    ) { paddingValues ->
        PullToRefreshBox(
            isRefreshing = uiState.isRefreshing,
            onRefresh = viewModel::refresh,
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                contentPadding = PaddingValues(top = 16.dp, bottom = 48.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
            // ── Section 1: WhatsApp Bill Verification Input ──────────────────
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardBorderGlow, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .background(Success.copy(alpha = 0.15f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Outlined.CheckCircle,
                                    contentDescription = null,
                                    tint = Success,
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            Column {
                                Text(
                                    "VERIFY WHATSAPP BILL",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Success,
                                        letterSpacing = 1.sp
                                    )
                                )
                                Text(
                                    "Enter bill code from WhatsApp or 12-digit UTR",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = TextSecondary,
                                        fontSize = 12.sp
                                    )
                                )
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = uiState.verifyCodeInput,
                                onValueChange = { viewModel.setVerifyCodeInput(it) },
                                placeholder = {
                                    Text(
                                        "e.g. GB-8492 or UTR",
                                        color = TextTertiary,
                                        fontSize = 14.sp
                                    )
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                                keyboardActions = KeyboardActions(
                                    onSearch = {
                                        keyboardController?.hide()
                                        viewModel.verifyBillCode()
                                    }
                                ),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedContainerColor = InputBackground,
                                    unfocusedContainerColor = InputBackground,
                                    focusedBorderColor = Primary,
                                    unfocusedBorderColor = InputBorder,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f)
                            )

                            Button(
                                onClick = {
                                    keyboardController?.hide()
                                    viewModel.verifyBillCode()
                                },
                                enabled = !uiState.isVerifying,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Primary,
                                    contentColor = Color.Black
                                ),
                                shape = RoundedCornerShape(12.dp),
                                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp)
                            ) {
                                if (uiState.isVerifying) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(18.dp),
                                        color = Color.Black,
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Text("Verify", fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        // Error message if lookup failed
                        if (uiState.verifyError != null) {
                            Text(
                                uiState.verifyError ?: "",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = Error,
                                    fontSize = 12.sp
                                )
                            )
                        }
                    }
                }
            }

            // ── Section 2: Verified Order & Customer Lifetime Dossier ────────
            if (uiState.verifiedResult != null) {
                val verified = uiState.verifiedResult!!
                val order = verified.order
                val dossier = verified.dossier

                item {
                    VerifiedDossierCard(
                        order = order,
                        dossier = dossier,
                        onDismiss = { viewModel.clearVerifiedResult() },
                        onCopyUtr = {
                            clipboardManager.setText(AnnotatedString(order.utrNumber))
                            Toast.makeText(context, "UTR copied: ${order.utrNumber}", Toast.LENGTH_SHORT).show()
                        },
                        onOpenDeliveryModal = {
                            viewModel.openDeliveryModal(order)
                        }
                    )
                }
            }

            // ── Section 3: Status Filter Pills ──────────────────────────────
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "ALL ORDERS",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = TextSecondary,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                        )
                        Text(
                            "${uiState.orders.size} orders",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = TextTertiary,
                                fontSize = 12.sp
                            )
                        )
                    }

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        item {
                            FilterPill(
                                label = "All",
                                count = uiState.orders.size,
                                isSelected = uiState.statusFilter == "all",
                                onClick = { viewModel.setStatusFilter("all") }
                            )
                        }
                        item {
                            FilterPill(
                                label = "Pending",
                                count = pendingCount,
                                isSelected = uiState.statusFilter == "pending",
                                pillColor = Warning,
                                onClick = { viewModel.setStatusFilter("pending") }
                            )
                        }
                        item {
                            FilterPill(
                                label = "Delivered",
                                count = deliveredCount,
                                isSelected = uiState.statusFilter == "delivered",
                                pillColor = Success,
                                onClick = { viewModel.setStatusFilter("delivered") }
                            )
                        }
                    }
                }
            }

            // ── Section 4: Orders Feed ──────────────────────────────────────
            if (uiState.isLoading && uiState.orders.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Primary)
                    }
                }
            } else if (uiState.orders.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Outlined.Inbox,
                                contentDescription = null,
                                tint = TextTertiary,
                                modifier = Modifier.size(40.dp)
                            )
                            Text(
                                "No orders found",
                                style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary)
                            )
                        }
                    }
                }
            } else {
                items(uiState.orders, key = { it.orderId }) { order ->
                    OrderCard(
                        order = order,
                        onCopyUtr = {
                            clipboardManager.setText(AnnotatedString(order.utrNumber))
                            Toast.makeText(context, "UTR copied: ${order.utrNumber}", Toast.LENGTH_SHORT).show()
                        },
                        onFulfillClick = {
                            viewModel.openDeliveryModal(order)
                        }
                    )
                }
            }
        }
        }
    }

    // ── Delivery Fulfillment Dialog ──────────────────────────────────────────
    if (uiState.selectedOrderForDelivery != null) {
        val order = uiState.selectedOrderForDelivery!!
        AlertDialog(
            onDismissRequest = { viewModel.closeDeliveryModal() },
            containerColor = Surface,
            titleContentColor = TextPrimary,
            shape = RoundedCornerShape(18.dp),
            title = {
                Column {
                    Text(
                        "Fulfill Order",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        order.orderCode,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = PrimaryBright,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        "Update the delivery status and add private notes (e.g. Steam account sent via WhatsApp):",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )

                    // Delivery Status Selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.setDeliveryStatusChoice("pending") },
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (uiState.deliveryStatusChoice == "pending") Warning.copy(alpha = 0.15f) else Color.Transparent,
                                contentColor = if (uiState.deliveryStatusChoice == "pending") Warning else TextSecondary
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (uiState.deliveryStatusChoice == "pending") Warning else Border
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Pending")
                        }

                        Button(
                            onClick = { viewModel.setDeliveryStatusChoice("delivered") },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (uiState.deliveryStatusChoice == "delivered") Success else SurfaceVariant,
                                contentColor = if (uiState.deliveryStatusChoice == "delivered") Color.White else TextSecondary
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Delivered")
                        }
                    }

                    // Delivery Notes Text Field
                    OutlinedTextField(
                        value = uiState.deliveryNotesInput,
                        onValueChange = { viewModel.setDeliveryNotesInput(it) },
                        placeholder = {
                            Text(
                                "e.g. Steam credentials sent to WhatsApp on 13 Sep",
                                color = TextTertiary,
                                fontSize = 12.sp
                            )
                        },
                        minLines = 3,
                        maxLines = 5,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = InputBackground,
                            unfocusedContainerColor = InputBackground,
                            focusedBorderColor = Primary,
                            unfocusedBorderColor = InputBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.saveDeliveryFulfillment(context) },
                    enabled = !uiState.isUpdatingDelivery,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Primary,
                        contentColor = Color.Black
                    )
                ) {
                    if (uiState.isUpdatingDelivery) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            color = Color.Black,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text("Save Fulfillment", fontWeight = FontWeight.Bold)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.closeDeliveryModal() }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun VerifiedDossierCard(
    order: Order,
    dossier: CustomerDossier,
    onDismiss: () -> Unit,
    onCopyUtr: () -> Unit,
    onOpenDeliveryModal: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.5.dp, Success.copy(alpha = 0.6f), RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0D1812)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header with badge and close button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        if (dossier.isRecurring) {
                            Box(
                                modifier = Modifier
                                    .background(Warning.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    "👑 RECURRING BUYER (${dossier.totalOrders} ORDERS)",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = Warning,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                            }
                        } else {
                            Box(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.08f), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    "✨ FIRST-TIME BUYER",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = TextSecondary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                            }
                        }
                    }

                    Spacer(Modifier.height(4.dp))
                    Text(
                        order.customerName.ifBlank { "Customer" },
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    if (order.customerEmail.isNotBlank()) {
                        Text(
                            order.customerEmail,
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                    }
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        Icons.Default.Close,
                        contentDescription = "Close",
                        tint = TextTertiary
                    )
                }
            }

            HorizontalDivider(color = BorderSubtle, thickness = 1.dp)

            // Lifetime Stats Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "Lifetime Spend",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary, fontSize = 10.sp)
                    )
                    Text(
                        "₹${dossier.totalSpent.toInt()}",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = Success
                        )
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "Total Orders",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary, fontSize = 10.sp)
                    )
                    Text(
                        "${dossier.totalOrders}",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = PrimaryBright
                        )
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "Bill Total",
                        style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary, fontSize = 10.sp)
                    )
                    Text(
                        "₹${order.total.toInt()}",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                }
            }

            // WhatsApp Bill Snapshot
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BackgroundDeep, RoundedCornerShape(10.dp))
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Bill Code: ${order.orderCode}",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = PrimaryBright
                        )
                    )
                    StatusBadge(deliveryStatus = order.deliveryStatus)
                }

                if (order.utrNumber.isNotBlank()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "UTR: ${order.utrNumber}",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                color = TextPrimary
                            )
                        )
                        IconButton(
                            onClick = onCopyUtr,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                Icons.Outlined.ContentCopy,
                                contentDescription = "Copy UTR",
                                tint = TextSecondary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                // Current Bill Items
                Text(
                    "Games In This Order (${order.items.size}):",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = TextSecondary,
                        fontWeight = FontWeight.Bold
                    )
                )
                order.items.forEach { item ->
                    OrderItemRow(item)
                }
            }

            // ── Upselling dossier: All lifetime games this customer bought ──
            val allPastItemNames = remember(dossier.pastOrders) {
                dossier.pastOrders
                    .flatMap { it.items }
                    .map { it.name }
                    .filter { it.isNotBlank() }
                    .distinct()
            }

            if (allPastItemNames.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Surface, RoundedCornerShape(10.dp))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            Icons.Outlined.ShoppingBag,
                            contentDescription = null,
                            tint = Warning,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            "Lifetime Game Library (${allPastItemNames.size})",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = Warning
                            )
                        )
                    }

                    Text(
                        "Tip: Use their taste to recommend sequels or add-ons on WhatsApp!",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = TextTertiary,
                            fontSize = 11.sp
                        )
                    )

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        items(allPastItemNames) { title ->
                            Box(
                                modifier = Modifier
                                    .background(SurfaceVariant, RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    title,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = TextPrimary,
                                        fontSize = 11.sp
                                    ),
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }

            // Delivery Notes (if set)
            if (order.deliveryNotes.isNotBlank()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Surface, RoundedCornerShape(8.dp))
                        .padding(10.dp)
                ) {
                    Text(
                        "Fulfillment Notes:",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = TextTertiary,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Text(
                        order.deliveryNotes,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = TextSecondary,
                            fontFamily = FontFamily.Monospace
                        )
                    )
                }
            }

            // Action Button
            Button(
                onClick = onOpenDeliveryModal,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary,
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    Icons.Outlined.LocalShipping,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    if (order.deliveryStatus.equals("delivered", ignoreCase = true)) "Update Notes / Status" else "Mark Delivered & Add Notes",
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: Order,
    onCopyUtr: () -> Unit,
    onFulfillClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorder, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = Surface),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Top Row: Code + Status Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        order.orderCode,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = PrimaryBright
                        )
                    )
                    if (order.createdAt != null) {
                        Text(
                            order.createdAt.take(10),
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = TextTertiary,
                                fontSize = 11.sp
                            )
                        )
                    }
                }
                StatusBadge(deliveryStatus = order.deliveryStatus)
            }

            // Customer Info
            Column {
                Text(
                    order.customerName.ifBlank { "Customer" },
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                )
                if (order.customerEmail.isNotBlank()) {
                    Text(
                        order.customerEmail,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    )
                }
            }

            // Items Preview
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                order.items.forEach { item ->
                    OrderItemRow(item)
                }
            }

            HorizontalDivider(color = BorderSubtle, thickness = 1.dp)

            // Bottom bar: Total + UTR + Fulfill button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "Total Paid",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = TextTertiary,
                            fontSize = 10.sp
                        )
                    )
                    Text(
                        "₹${order.total.toInt()}",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Success
                        )
                    )
                }

                if (order.utrNumber.isNotBlank()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .background(SurfaceVariant, RoundedCornerShape(8.dp))
                            .clickable { onCopyUtr() }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            "UTR: ${order.utrNumber}",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp
                            )
                        )
                        Spacer(Modifier.width(4.dp))
                        Icon(
                            Icons.Outlined.ContentCopy,
                            contentDescription = "Copy",
                            tint = TextSecondary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }

                Button(
                    onClick = onFulfillClick,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (order.deliveryStatus.equals("delivered", ignoreCase = true)) SurfaceVariant else Primary,
                        contentColor = if (order.deliveryStatus.equals("delivered", ignoreCase = true)) TextPrimary else Color.Black
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        if (order.deliveryStatus.equals("delivered", ignoreCase = true)) "Notes" else "Fulfill",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            if (order.deliveryNotes.isNotBlank()) {
                Text(
                    "Note: ${order.deliveryNotes}",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = TextTertiary,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun OrderItemRow(item: OrderItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .padding(6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (!item.image.isNullOrBlank()) {
            AsyncImage(
                model = item.image,
                contentDescription = item.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(BackgroundDeep)
            )
        } else {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(BackgroundDeep),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Outlined.Gamepad,
                    contentDescription = null,
                    tint = TextTertiary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        Text(
            item.name,
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = FontWeight.Medium,
                color = TextPrimary
            ),
            modifier = Modifier.weight(1f),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        Text(
            "₹${item.price.toInt()}",
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        )
    }
}

@Composable
private fun StatusBadge(deliveryStatus: String) {
    val isDelivered = deliveryStatus.equals("delivered", ignoreCase = true)
    val bg = if (isDelivered) Success.copy(alpha = 0.15f) else Warning.copy(alpha = 0.15f)
    val fg = if (isDelivered) Success else Warning
    val label = if (isDelivered) "DELIVERED" else "PENDING"

    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelSmall.copy(
                color = fg,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 10.sp,
                letterSpacing = 0.8.sp
            )
        )
    }
}

@Composable
private fun FilterPill(
    label: String,
    count: Int,
    isSelected: Boolean,
    pillColor: Color = Primary,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(
                if (isSelected) pillColor.copy(alpha = 0.2f) else SurfaceVariant
            )
            .border(
                1.dp,
                if (isSelected) pillColor else BorderSubtle,
                RoundedCornerShape(20.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        Text(
            "$label ($count)",
            style = MaterialTheme.typography.labelSmall.copy(
                color = if (isSelected) pillColor else TextSecondary,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontSize = 12.sp
            )
        )
    }
}
