package com.gamerbhidu.admin.ui.screens.proofs

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.SocialProof
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import com.gamerbhidu.admin.util.ToastUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SocialProofsUiState(
    val proofs: List<SocialProof> = emptyList(),
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val deleteConfirmProof: SocialProof? = null,
    val isDeletingId: String? = null,
    val togglingVisibilityId: String? = null,

    // Add Proof Dialog state
    val isAddDialogOpen: Boolean = false,
    val formLabel: String = "",
    val formTag: String = "Order Delivered",
    val formImageUrl: String = "",
    val formVisible: Boolean = true,
    val isUploadingImage: Boolean = false,
    val isSaving: Boolean = false,
    val formError: String? = null
)

class SocialProofsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(SocialProofsUiState())
    val uiState: StateFlow<SocialProofsUiState> = _uiState

    init { loadProofs() }

    fun loadProofs() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val proofs = AdminRepository.getSocialProofs()
                _uiState.update { it.copy(proofs = proofs, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to load social proofs.")) }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true, error = null) }
        viewModelScope.launch {
            try {
                val proofs = AdminRepository.getSocialProofs()
                _uiState.update { it.copy(proofs = proofs, isRefreshing = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isRefreshing = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to refresh social proofs.")) }
            }
        }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    // ── Visibility Toggle ────────────────────────────────────────────────────
    fun toggleVisibility(proof: SocialProof, context: Context? = null) {
        val id = proof.id ?: return
        val newVisible = !proof.visible
        // Optimistic update
        _uiState.update { state ->
            state.copy(
                togglingVisibilityId = id,
                proofs = state.proofs.map { if (it.id == id) it.copy(visible = newVisible) else it }
            )
        }
        viewModelScope.launch {
            try {
                AdminRepository.toggleSocialProofVisibility(id, newVisible)
                _uiState.update { it.copy(togglingVisibilityId = null) }
                context?.let {
                    ToastUtils.showSuccess(it, if (newVisible) "Proof is now visible on storefront" else "Proof hidden from storefront")
                }
            } catch (e: Exception) {
                // Rollback on failure
                val errMsg = NetworkErrorHandler.getUiMessage(e, "Failed to update visibility.")
                _uiState.update { state ->
                    state.copy(
                        togglingVisibilityId = null,
                        proofs = state.proofs.map { if (it.id == id) it.copy(visible = !newVisible) else it },
                        error = errMsg
                    )
                }
                context?.let { ToastUtils.showError(it, errMsg) }
            }
        }
    }

    // ── Add Proof Dialog ─────────────────────────────────────────────────────
    fun openAddDialog() {
        _uiState.update {
            it.copy(
                isAddDialogOpen = true,
                formLabel = "",
                formTag = "Order Delivered",
                formImageUrl = "",
                formVisible = true,
                isUploadingImage = false,
                isSaving = false,
                formError = null
            )
        }
    }

    fun closeAddDialog() {
        _uiState.update { it.copy(isAddDialogOpen = false, formError = null) }
    }

    fun setFormLabel(label: String) {
        _uiState.update { it.copy(formLabel = label, formError = null) }
    }

    fun setFormTag(tag: String) {
        _uiState.update { it.copy(formTag = tag) }
    }

    fun setFormImageUrl(url: String) {
        _uiState.update { it.copy(formImageUrl = url, formError = null) }
    }

    fun setFormVisible(visible: Boolean) {
        _uiState.update { it.copy(formVisible = visible) }
    }

    fun uploadProofImage(context: Context, uri: Uri) {
        _uiState.update { it.copy(isUploadingImage = true, formError = null) }
        viewModelScope.launch {
            try {
                val publicUrl = AdminRepository.uploadSocialProofImage(context, uri)
                _uiState.update { it.copy(formImageUrl = publicUrl, isUploadingImage = false) }
                ToastUtils.showSuccess(context, "Image uploaded and optimized successfully!")
            } catch (e: Exception) {
                val errMsg = NetworkErrorHandler.getUiMessage(e, "Failed to upload image.")
                _uiState.update {
                    it.copy(
                        isUploadingImage = false,
                        formError = errMsg
                    )
                }
                ToastUtils.showError(context, errMsg)
            }
        }
    }

    fun saveNewProof(context: Context? = null) {
        val label = _uiState.value.formLabel.trim()
        val imageUrl = _uiState.value.formImageUrl.trim()
        val tag = _uiState.value.formTag.trim().ifBlank { "Order Delivered" }
        val visible = _uiState.value.formVisible

        if (imageUrl.isBlank()) {
            _uiState.update { it.copy(formError = "Please select or paste an image.") }
            return
        }
        if (label.isBlank()) {
            _uiState.update { it.copy(formError = "Please provide a label for this proof.") }
            return
        }

        _uiState.update { it.copy(isSaving = true, formError = null) }
        viewModelScope.launch {
            try {
                val created = AdminRepository.addSocialProof(
                    SocialProof(
                        label = label,
                        imageUrl = imageUrl,
                        tag = tag,
                        visible = visible
                    )
                )
                _uiState.update { state ->
                    state.copy(
                        proofs = state.proofs + created,
                        isSaving = false,
                        isAddDialogOpen = false
                    )
                }
                context?.let { ToastUtils.showSuccess(it, "Social proof added successfully!") }
            } catch (e: Exception) {
                val errMsg = NetworkErrorHandler.getUiMessage(e, "Failed to save proof.")
                _uiState.update {
                    it.copy(
                        isSaving = false,
                        formError = errMsg
                    )
                }
                context?.let { ToastUtils.showError(it, errMsg) }
            }
        }
    }

    // ── Delete Proof ─────────────────────────────────────────────────────────
    fun requestDelete(proof: SocialProof) = _uiState.update { it.copy(deleteConfirmProof = proof) }
    fun cancelDelete() = _uiState.update { it.copy(deleteConfirmProof = null) }

    fun confirmDelete(context: Context? = null) {
        val proof = _uiState.value.deleteConfirmProof ?: return
        val id = proof.id ?: return
        _uiState.update { it.copy(isDeletingId = id, deleteConfirmProof = null) }
        viewModelScope.launch {
            try {
                AdminRepository.deleteSocialProof(id, proof.imageUrl)
                _uiState.update { state ->
                    state.copy(proofs = state.proofs.filter { it.id != id }, isDeletingId = null)
                }
                context?.let { ToastUtils.showSuccess(it, "Social proof deleted") }
            } catch (e: Exception) {
                val errMsg = NetworkErrorHandler.getUiMessage(e)
                _uiState.update { it.copy(isDeletingId = null, error = errMsg) }
                context?.let { ToastUtils.showError(it, errMsg) }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}
