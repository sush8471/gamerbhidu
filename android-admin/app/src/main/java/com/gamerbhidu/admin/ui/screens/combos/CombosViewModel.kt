package com.gamerbhidu.admin.ui.screens.combos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.Combo
import com.gamerbhidu.admin.data.model.ComboGameDetail
import com.gamerbhidu.admin.data.model.ComboWithGames
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Form state for the Add/Edit combo sheet */
data class ComboFormState(
    val title: String = "",
    val description: String = "",
    val curiosityCue: String = "",
    val valueAnchor: String = "",
    val imageUrl: String = "",
    val originalPrice: String = "",
    val discountedPrice: String = "",
    val dealExpiresAt: String = "",
    val visible: Boolean = true
) {
    val isValid: Boolean
        get() = title.isNotBlank() && discountedPrice.toDoubleOrNull() != null

    val discountPercent: Double?
        get() {
            val orig = originalPrice.toDoubleOrNull() ?: return null
            val disc = discountedPrice.toDoubleOrNull() ?: return null
            if (orig <= 0 || disc <= 0 || disc >= orig) return null
            return ((orig - disc) / orig) * 100
        }
}

data class CombosUiState(
    val combos: List<ComboWithGames> = emptyList(),
    val isLoading: Boolean = true,

    // Add/Edit sheet
    val sheetMode: SheetMode = SheetMode.NONE,
    val editingComboId: String? = null,
    val form: ComboFormState = ComboFormState(),
    val isSaving: Boolean = false,
    val formError: String? = null,

    // Game picker inside sheet
    val allVisibleGames: List<Game> = emptyList(),
    val pickerGames: List<Game> = emptyList(), // games not yet in editing combo
    val pickerQuery: String = "",
    val isPickerOpen: Boolean = false,
    val selectedComboGames: List<ComboGameDetail> = emptyList(), // for editing

    // Delete
    val deleteTargetId: String? = null,
    val isDeleting: Boolean = false,

    // Toggle
    val togglingId: String? = null,

    // Error
    val error: String? = null
) {
    enum class SheetMode { NONE, ADD, EDIT }
}

class CombosViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(CombosUiState())
    val uiState: StateFlow<CombosUiState> = _uiState

    init {
        loadCombos()
    }

    fun refresh() = loadCombos()

    private fun loadCombos() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val raw = AdminRepository.getCombos()
                // Fetch games for each combo concurrently (lazy — expanded on demand)
                val withGames = raw.map { combo ->
                    ComboWithGames(combo = combo, games = emptyList())
                }
                val allGames = AdminRepository.getAllVisibleGames()
                _uiState.update {
                    it.copy(
                        combos = withGames,
                        allVisibleGames = allGames,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to load combos.")
                    )
                }
            }
        }
    }

    /** Expand a combo to load its games (called when user taps expand button) */
    fun loadComboGames(comboId: String) {
        viewModelScope.launch {
            try {
                val games = AdminRepository.getComboGames(comboId)
                _uiState.update { state ->
                    state.copy(
                        combos = state.combos.map { c ->
                            if (c.combo.id == comboId) c.copy(games = games) else c
                        }
                    )
                }
            } catch (e: Exception) {
                // Non-critical: silently fail
            }
        }
    }

    // ── Toggle visibility ────────────────────────────────────────────────────

    fun toggleVisibility(combo: Combo) {
        val id = combo.id ?: return
        val newVisible = !combo.visible
        // Optimistic update
        _uiState.update { state ->
            state.copy(
                togglingId = id,
                combos = state.combos.map { c ->
                    if (c.combo.id == id) c.copy(combo = c.combo.copy(visible = newVisible)) else c
                }
            )
        }
        viewModelScope.launch {
            try {
                AdminRepository.toggleComboVisibility(id, newVisible)
            } catch (e: Exception) {
                // Revert
                _uiState.update { state ->
                    state.copy(
                        combos = state.combos.map { c ->
                            if (c.combo.id == id) c.copy(combo = c.combo.copy(visible = !newVisible)) else c
                        },
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to update visibility.")
                    )
                }
            } finally {
                _uiState.update { it.copy(togglingId = null) }
            }
        }
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    fun requestDelete(comboId: String) = _uiState.update { it.copy(deleteTargetId = comboId) }
    fun cancelDelete() = _uiState.update { it.copy(deleteTargetId = null) }

    fun confirmDelete() {
        val id = _uiState.value.deleteTargetId ?: return
        _uiState.update { it.copy(isDeleting = true, deleteTargetId = null) }
        viewModelScope.launch {
            try {
                AdminRepository.deleteCombo(id)
                _uiState.update { state ->
                    state.copy(
                        combos = state.combos.filter { it.combo.id != id },
                        isDeleting = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isDeleting = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to delete combo.")
                    )
                }
            }
        }
    }

    // ── Add Sheet ────────────────────────────────────────────────────────────

    fun openAddSheet() {
        _uiState.update {
            it.copy(
                sheetMode = CombosUiState.SheetMode.ADD,
                editingComboId = null,
                form = ComboFormState(),
                selectedComboGames = emptyList(),
                formError = null
            )
        }
    }

    // ── Edit Sheet ───────────────────────────────────────────────────────────

    fun openEditSheet(comboWithGames: ComboWithGames) {
        val combo = comboWithGames.combo
        val form = ComboFormState(
            title = combo.title,
            description = combo.description ?: "",
            curiosityCue = combo.curiosityCue ?: "",
            valueAnchor = combo.valueAnchor ?: "",
            imageUrl = combo.imageUrl ?: "",
            originalPrice = combo.originalPrice?.toString() ?: "",
            discountedPrice = if (combo.discountedPrice > 0) combo.discountedPrice.toString() else "",
            dealExpiresAt = combo.dealExpiresAt ?: "",
            visible = combo.visible
        )
        _uiState.update {
            it.copy(
                sheetMode = CombosUiState.SheetMode.EDIT,
                editingComboId = combo.id,
                form = form,
                selectedComboGames = comboWithGames.games,
                formError = null
            )
        }
        // Refresh the game list for this combo if not yet loaded
        combo.id?.let { loadComboGames(it) }
    }

    fun closeSheet() {
        _uiState.update {
            it.copy(
                sheetMode = CombosUiState.SheetMode.NONE,
                editingComboId = null,
                formError = null
            )
        }
    }

    // ── Form field updates ───────────────────────────────────────────────────

    fun onFormChange(update: ComboFormState.() -> ComboFormState) {
        _uiState.update { it.copy(form = it.form.update()) }
    }

    // ── Save ─────────────────────────────────────────────────────────────────

    fun save() {
        val state = _uiState.value
        if (!state.form.isValid) {
            _uiState.update { it.copy(formError = "Title and discounted price are required.") }
            return
        }
        _uiState.update { it.copy(isSaving = true, formError = null) }
        viewModelScope.launch {
            try {
                val form = state.form
                val maxOrder = state.combos.maxOfOrNull { it.combo.displayOrder } ?: 0

                val payload = Combo(
                    title = form.title.trim(),
                    description = form.description.trim().ifBlank { null },
                    imageUrl = form.imageUrl.trim().ifBlank { null },
                    originalPrice = form.originalPrice.toDoubleOrNull(),
                    discountedPrice = form.discountedPrice.toDouble(),
                    curiosityCue = form.curiosityCue.trim().ifBlank { null },
                    valueAnchor = form.valueAnchor.trim().ifBlank { null },
                    visible = form.visible,
                    dealExpiresAt = form.dealExpiresAt.trim().ifBlank { null },
                    displayOrder = if (state.sheetMode == CombosUiState.SheetMode.ADD) maxOrder + 10 else {
                        state.combos.firstOrNull { it.combo.id == state.editingComboId }?.combo?.displayOrder ?: (maxOrder + 10)
                    }
                )

                if (state.sheetMode == CombosUiState.SheetMode.ADD) {
                    val created = AdminRepository.addCombo(payload)
                    _uiState.update { s ->
                        s.copy(
                            combos = s.combos + ComboWithGames(combo = created),
                            sheetMode = CombosUiState.SheetMode.NONE,
                            isSaving = false
                        )
                    }
                } else {
                    val id = state.editingComboId!!
                    AdminRepository.updateCombo(id, payload)
                    _uiState.update { s ->
                        s.copy(
                            combos = s.combos.map { c ->
                                if (c.combo.id == id) c.copy(combo = payload.copy(id = id)) else c
                            },
                            sheetMode = CombosUiState.SheetMode.NONE,
                            isSaving = false
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isSaving = false,
                        formError = NetworkErrorHandler.getUiMessage(e, "Failed to save combo.")
                    )
                }
            }
        }
    }

    // ── Game picker inside sheet ─────────────────────────────────────────────

    fun openPicker() {
        val inCombo = _uiState.value.selectedComboGames.map { it.gameId }.toSet()
        val available = _uiState.value.allVisibleGames.filter { it.id !in inCombo }
        _uiState.update { it.copy(isPickerOpen = true, pickerQuery = "", pickerGames = available) }
    }

    fun closePicker() = _uiState.update { it.copy(isPickerOpen = false) }

    fun onPickerQueryChange(q: String) {
        val inCombo = _uiState.value.selectedComboGames.map { it.gameId }.toSet()
        val filtered = _uiState.value.allVisibleGames
            .filter { it.id !in inCombo }
            .let { list ->
                if (q.isBlank()) list
                else list.filter { it.title.lowercase().contains(q.lowercase()) }
            }
        _uiState.update { it.copy(pickerQuery = q, pickerGames = filtered) }
    }

    /** Add game to combo (and persist if editing an existing combo) */
    fun addGameToCombo(game: Game) {
        val gameId = game.id ?: return
        _uiState.update { it.copy(isPickerOpen = false) }

        val editingId = _uiState.value.editingComboId
        val tempDetail = ComboGameDetail(
            comboGameId = "pending-$gameId",
            gameId = gameId,
            title = game.title,
            imageUrl = game.imageUrl,
            sellingPrice = game.sellingPrice?.toDouble()
        )

        // Optimistically add to UI
        _uiState.update { s ->
            s.copy(selectedComboGames = s.selectedComboGames + tempDetail)
        }

        if (editingId != null) {
            // Persist immediately for edit mode
            viewModelScope.launch {
                try {
                    AdminRepository.addGameToCombo(editingId, gameId)
                    // Reload to get real combo_games id
                    val updated = AdminRepository.getComboGames(editingId)
                    _uiState.update { it.copy(selectedComboGames = updated) }
                    // Also refresh in the combo list
                    _uiState.update { state ->
                        state.copy(
                            combos = state.combos.map { c ->
                                if (c.combo.id == editingId) c.copy(games = updated) else c
                            }
                        )
                    }
                } catch (e: Exception) {
                    // Revert optimistic
                    _uiState.update { s ->
                        s.copy(
                            selectedComboGames = s.selectedComboGames.filter { it.gameId != gameId },
                            error = NetworkErrorHandler.getUiMessage(e, "Failed to add game.")
                        )
                    }
                }
            }
        }
        // For ADD mode: games are stored in selectedComboGames and persisted after save()
    }

    /** Remove game from combo */
    fun removeGameFromCombo(detail: ComboGameDetail) {
        val editingId = _uiState.value.editingComboId

        // Optimistic removal
        _uiState.update { s ->
            s.copy(selectedComboGames = s.selectedComboGames.filter { it.comboGameId != detail.comboGameId })
        }

        if (editingId != null && !detail.comboGameId.startsWith("pending-")) {
            viewModelScope.launch {
                try {
                    AdminRepository.removeGameFromCombo(detail.comboGameId)
                    val updated = AdminRepository.getComboGames(editingId)
                    _uiState.update { state ->
                        state.copy(
                            combos = state.combos.map { c ->
                                if (c.combo.id == editingId) c.copy(games = updated) else c
                            }
                        )
                    }
                } catch (e: Exception) {
                    // Revert
                    _uiState.update { s ->
                        s.copy(
                            selectedComboGames = s.selectedComboGames + detail,
                            error = NetworkErrorHandler.getUiMessage(e, "Failed to remove game.")
                        )
                    }
                }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}
