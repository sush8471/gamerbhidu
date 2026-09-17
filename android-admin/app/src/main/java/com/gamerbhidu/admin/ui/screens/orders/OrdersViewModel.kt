package com.gamerbhidu.admin.ui.screens.orders

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.Order
import com.gamerbhidu.admin.data.model.OrderVerificationResult
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import com.gamerbhidu.admin.util.ToastUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OrdersUiState(
    val orders: List<Order> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
    val statusFilter: String = "all", // "all", "pending", "delivered"
    val searchQuery: String = "",
    val verifyCodeInput: String = "",
    val isVerifying: Boolean = false,
    val verifiedResult: OrderVerificationResult? = null,
    val verifyError: String? = null,
    val selectedOrderForDelivery: Order? = null,
    val deliveryStatusChoice: String = "delivered", // "pending" | "delivered"
    val deliveryNotesInput: String = "",
    val isUpdatingDelivery: Boolean = false,
    val isRefreshing: Boolean = false
)

class OrdersViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersUiState())
    val uiState: StateFlow<OrdersUiState> = _uiState

    init {
        loadOrders()
    }

    fun loadOrders() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val orders = AdminRepository.getOrders(
                    deliveryStatus = _uiState.value.statusFilter,
                    search = _uiState.value.searchQuery
                )
                _uiState.update { it.copy(orders = orders, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to load orders.")) }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true, error = null) }
        viewModelScope.launch {
            try {
                val orders = AdminRepository.getOrders(
                    deliveryStatus = _uiState.value.statusFilter,
                    search = _uiState.value.searchQuery
                )
                _uiState.update { it.copy(orders = orders, isRefreshing = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isRefreshing = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to refresh orders.")) }
            }
        }
    }

    fun setStatusFilter(filter: String) {
        if (_uiState.value.statusFilter == filter) return
        _uiState.update { it.copy(statusFilter = filter) }
        loadOrders()
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        loadOrders()
    }

    fun setVerifyCodeInput(code: String) {
        _uiState.update { it.copy(verifyCodeInput = code, verifyError = null) }
    }

    fun verifyBillCode() {
        val code = _uiState.value.verifyCodeInput.trim()
        if (code.isBlank()) {
            _uiState.update { it.copy(verifyError = "Please enter an order bill code or UTR") }
            return
        }

        _uiState.update { it.copy(isVerifying = true, verifyError = null) }
        viewModelScope.launch {
            try {
                val result = AdminRepository.verifyOrderCode(code)
                if (result != null) {
                    _uiState.update {
                        it.copy(
                            isVerifying = false,
                            verifiedResult = result,
                            verifyError = null
                        )
                    }
                } else {
                    _uiState.update {
                        it.copy(
                            isVerifying = false,
                            verifyError = "No order bill found matching \"$code\". Check the WhatsApp message."
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isVerifying = false,
                        verifyError = NetworkErrorHandler.getUiMessage(e, "Verification failed.")
                    )
                }
            }
        }
    }

    fun clearVerifiedResult() {
        _uiState.update { it.copy(verifiedResult = null, verifyError = null) }
    }

    fun openDeliveryModal(order: Order) {
        _uiState.update {
            it.copy(
                selectedOrderForDelivery = order,
                deliveryStatusChoice = if (order.deliveryStatus.lowercase() == "delivered") "delivered" else "delivered",
                deliveryNotesInput = order.deliveryNotes
            )
        }
    }

    fun closeDeliveryModal() {
        _uiState.update { it.copy(selectedOrderForDelivery = null) }
    }

    fun setDeliveryStatusChoice(status: String) {
        _uiState.update { it.copy(deliveryStatusChoice = status) }
    }

    fun setDeliveryNotesInput(notes: String) {
        _uiState.update { it.copy(deliveryNotesInput = notes) }
    }

    fun saveDeliveryFulfillment(context: Context? = null) {
        val order = _uiState.value.selectedOrderForDelivery ?: return
        val statusChoice = _uiState.value.deliveryStatusChoice
        val notes = _uiState.value.deliveryNotesInput

        _uiState.update { it.copy(isUpdatingDelivery = true) }
        viewModelScope.launch {
            try {
                AdminRepository.updateOrderDelivery(
                    orderId = order.orderId,
                    deliveryStatus = statusChoice,
                    deliveryNotes = notes
                )
                // If the verified result matches this order, update it too
                val updatedVerified = if (_uiState.value.verifiedResult?.order?.orderId == order.orderId) {
                    _uiState.value.verifiedResult?.copy(
                        order = order.copy(
                            deliveryStatus = statusChoice,
                            status = if (statusChoice == "delivered") "delivered" else "pending",
                            deliveryNotes = notes
                        )
                    )
                } else _uiState.value.verifiedResult

                _uiState.update {
                    it.copy(
                        isUpdatingDelivery = false,
                        selectedOrderForDelivery = null,
                        verifiedResult = updatedVerified
                    )
                }
                val shortId = if (order.orderId.length > 8) order.orderId.takeLast(8).uppercase() else order.orderId.uppercase()
                context?.let {
                    ToastUtils.showSuccess(it, "Order #$shortId marked as ${statusChoice.replaceFirstChar { c -> c.uppercase() }}")
                }
                loadOrders()
            } catch (e: Exception) {
                val errMsg = NetworkErrorHandler.getUiMessage(e, "Failed to update delivery status.")
                _uiState.update {
                    it.copy(
                        isUpdatingDelivery = false,
                        error = errMsg
                    )
                }
                context?.let { ToastUtils.showError(it, errMsg) }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
