package com.gamerbhidu.admin.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.DashboardStats
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class DashboardUiState(
    val stats: DashboardStats = DashboardStats(),
    val adminEmail: String = "",
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: String? = null
)

class DashboardViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadData()
    }

    fun loadData() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val stats = AdminRepository.getDashboardStats()
                val email = AdminRepository.currentUserEmail() ?: "Administrator"
                _uiState.update {
                    it.copy(
                        stats = stats,
                        adminEmail = email,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to load dashboard data.")
                    )
                }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true, error = null) }
        viewModelScope.launch {
            try {
                val stats = AdminRepository.getDashboardStats()
                val email = AdminRepository.currentUserEmail() ?: "Administrator"
                _uiState.update {
                    it.copy(
                        stats = stats,
                        adminEmail = email,
                        isRefreshing = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isRefreshing = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to refresh dashboard.")
                    )
                }
            }
        }
    }

    fun signOut(onComplete: () -> Unit) {
        viewModelScope.launch {
            runCatching { AdminRepository.signOut() }
            onComplete()
        }
    }
}
