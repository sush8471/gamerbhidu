package com.gamerbhidu.admin.ui.screens.sections

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.data.model.HomepageSection
import com.gamerbhidu.admin.data.model.SectionGameWithGame
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomepageSectionsUiState(
    // Sections sidebar
    val sections: List<HomepageSection> = emptyList(),
    val activeSectionId: String? = null,
    val isSectionsLoading: Boolean = true,

    // Games in active section
    val sectionGames: List<SectionGameWithGame> = emptyList(),
    val isSectionGamesLoading: Boolean = false,

    // Game picker
    val allVisibleGames: List<Game> = emptyList(),
    val pickerQuery: String = "",
    val isPickerOpen: Boolean = false,
    val isAddingGame: Boolean = false,

    // Remove
    val removingGameId: String? = null, // sectionGameId being removed

    // Reorder
    val isReordering: Boolean = false,

    // Error
    val error: String? = null
) {
    val activeSection: HomepageSection?
        get() = sections.firstOrNull { it.id == activeSectionId }

    /** Games not yet added to the active section, filtered by picker search query */
    val pickerGames: List<Game>
        get() {
            val inSection = sectionGames.map { it.gameId }.toSet()
            val q = pickerQuery.trim().lowercase()
            return allVisibleGames
                .filter { it.id !in inSection }
                .let { list ->
                    if (q.isBlank()) list
                    else list.filter { it.title.lowercase().contains(q) }
                }
        }
}

class HomepageSectionsViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(HomepageSectionsUiState())
    val uiState: StateFlow<HomepageSectionsUiState> = _uiState

    init {
        loadInitialData()
    }

    fun refresh() = loadInitialData()

    private fun loadInitialData() {
        _uiState.update { it.copy(isSectionsLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val sections = AdminRepository.getSections()
                val allGames = try {
                    AdminRepository.getAllVisibleGames()
                } catch (e: Exception) {
                    android.util.Log.w("HomepageSectionsVM", "Failed to fetch games for picker", e)
                    emptyList()
                }
                val firstId = sections.firstOrNull()?.id
                _uiState.update {
                    it.copy(
                        sections = sections,
                        activeSectionId = firstId,
                        allVisibleGames = allGames,
                        isSectionsLoading = false
                    )
                }
                firstId?.let { loadSectionGames(it) }
            } catch (e: Exception) {
                android.util.Log.e("HomepageSectionsVM", "Failed to load sections", e)
                _uiState.update {
                    it.copy(
                        isSectionsLoading = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to load sections.")
                    )
                }
            }
        }
    }

    fun selectSection(sectionId: String) {
        if (_uiState.value.activeSectionId == sectionId) return
        _uiState.update { it.copy(activeSectionId = sectionId, sectionGames = emptyList()) }
        loadSectionGames(sectionId)
    }

    private fun loadSectionGames(sectionId: String) {
        _uiState.update { it.copy(isSectionGamesLoading = true) }
        viewModelScope.launch {
            try {
                val games = AdminRepository.getSectionGames(sectionId)
                _uiState.update { it.copy(sectionGames = games, isSectionGamesLoading = false) }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isSectionGamesLoading = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to load section games.")
                    )
                }
            }
        }
    }

    // ── Game Picker ─────────────────────────────────────────────────────────

    fun openPicker() = _uiState.update { it.copy(isPickerOpen = true, pickerQuery = "") }
    fun closePicker() = _uiState.update { it.copy(isPickerOpen = false, pickerQuery = "") }
    fun onPickerQueryChange(q: String) = _uiState.update { it.copy(pickerQuery = q) }

    fun addGame(gameId: String) {
        val sectionId = _uiState.value.activeSectionId ?: return
        _uiState.update { it.copy(isAddingGame = true, isPickerOpen = false, pickerQuery = "") }
        viewModelScope.launch {
            try {
                AdminRepository.addGameToSectionById(sectionId, gameId)
                val updated = AdminRepository.getSectionGames(sectionId)
                _uiState.update { it.copy(sectionGames = updated, isAddingGame = false) }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isAddingGame = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to add game.")
                    )
                }
            }
        }
    }

    // ── Remove ──────────────────────────────────────────────────────────────

    fun removeGame(sectionGameId: String) {
        _uiState.update { it.copy(removingGameId = sectionGameId) }
        viewModelScope.launch {
            try {
                AdminRepository.removeGameFromSectionById(sectionGameId)
                _uiState.update { state ->
                    state.copy(
                        sectionGames = state.sectionGames.filter { it.sectionGameId != sectionGameId },
                        removingGameId = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        removingGameId = null,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to remove game.")
                    )
                }
            }
        }
    }

    // ── Reorder (move up / move down) ────────────────────────────────────────

    fun moveUp(index: Int) = reorder(index, index - 1)
    fun moveDown(index: Int) = reorder(index, index + 1)

    private fun reorder(from: Int, to: Int) {
        val list = _uiState.value.sectionGames.toMutableList()
        if (to < 0 || to >= list.size) return
        val temp = list[from]
        list[from] = list[to]
        list[to] = temp
        _uiState.update { it.copy(sectionGames = list, isReordering = true) }

        viewModelScope.launch {
            try {
                val updates = list.mapIndexed { i, sg -> sg.sectionGameId to ((i + 1) * 10) }
                AdminRepository.reorderSectionGames(updates)
            } catch (e: Exception) {
                // Non-fatal — local order already updated optimistically
            } finally {
                _uiState.update { it.copy(isReordering = false) }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}
