package com.gamerbhidu.admin.ui.screens.games

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class GamesListUiState(
    val games: List<Game> = emptyList(),        // currently loaded page(s)
    val isLoading: Boolean = true,              // first-page load spinner
    val isLoadingMore: Boolean = false,         // "load more" footer spinner
    val hasReachedEnd: Boolean = false,         // true when no more pages exist
    val error: String? = null,

    // Filters (map to server-side params on refetch)
    val searchQuery: String = "",
    val selectedVisibility: String = "all",     // "all" | "visible" | "hidden"
    val selectedStatus: String = "all",         // "all" | "released" | "upcoming"
    val selectedGenre: String = "All",          // "All" | "Action" | "RPG" etc.
    val viewMode: String = "grid",              // "grid" | "table"

    // Per-item action state
    val togglingVisibilityId: String? = null,
    val deleteConfirmGame: Game? = null,
    val isDeletingId: String? = null,

    // Internal pagination cursor
    val currentPage: Int = 0
) {
    val displayedGames: List<Game>
        get() {
            if (selectedGenre.equals("All", ignoreCase = true) || selectedGenre.isBlank()) {
                return games
            }
            return games.filter { game ->
                game.genre.any { it.equals(selectedGenre, ignoreCase = true) }
            }
        }
}

class GamesListViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(GamesListUiState())
    val uiState: StateFlow<GamesListUiState> = _uiState

    private var searchJob: Job? = null

    init {
        loadFirstPage()
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /** Called by pull-to-refresh or the refresh icon — resets to page 0 */
    fun loadGames() = loadFirstPage()

    /** Called by the infinite-scroll trigger in the list */
    fun loadNextPage() {
        val state = _uiState.value
        if (state.isLoadingMore || state.hasReachedEnd || state.isLoading) return
        fetchPage(page = state.currentPage + 1, append = true)
    }

    fun setViewMode(mode: String) {
        _uiState.update { it.copy(viewMode = mode) }
    }

    fun onGenreSelected(genre: String) {
        _uiState.update { it.copy(selectedGenre = genre) }
    }

    fun onSearchChange(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        // Debounce search — wait 400ms of inactivity before hitting the server
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(400)
            loadFirstPage()
        }
    }

    fun onVisibilitySelected(v: String) {
        _uiState.update { it.copy(selectedVisibility = v) }
        loadFirstPage()
    }

    fun onStatusSelected(s: String) {
        _uiState.update { it.copy(selectedStatus = s) }
        loadFirstPage()
    }

    fun toggleVisibility(game: Game) {
        _uiState.update { it.copy(togglingVisibilityId = game.id) }
        viewModelScope.launch {
            try {
                val newVisible = !game.visible
                AdminRepository.toggleGameVisibility(game.id!!, newVisible)
                _uiState.update { state ->
                    state.copy(
                        games = state.games.map { if (it.id == game.id) it.copy(visible = newVisible) else it },
                        togglingVisibilityId = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(togglingVisibilityId = null, error = NetworkErrorHandler.getUiMessage(e)) }
            }
        }
    }

    fun requestDelete(game: Game) = _uiState.update { it.copy(deleteConfirmGame = game) }
    fun cancelDelete() = _uiState.update { it.copy(deleteConfirmGame = null) }

    fun confirmDelete() {
        val game = _uiState.value.deleteConfirmGame ?: return
        _uiState.update { it.copy(isDeletingId = game.id, deleteConfirmGame = null) }
        viewModelScope.launch {
            try {
                AdminRepository.deleteGame(game.id!!)
                _uiState.update { state ->
                    state.copy(games = state.games.filter { it.id != game.id }, isDeletingId = null)
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isDeletingId = null, error = NetworkErrorHandler.getUiMessage(e)) }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }

    // ── Private helpers ────────────────────────────────────────────────────────

    private fun loadFirstPage() {
        searchJob?.cancel()
        fetchPage(page = 0, append = false)
    }

    private fun fetchPage(page: Int, append: Boolean) {
        val state = _uiState.value
        if (append) {
            _uiState.update { it.copy(isLoadingMore = true, error = null) }
        } else {
            _uiState.update { it.copy(isLoading = true, error = null, hasReachedEnd = false) }
        }

        viewModelScope.launch {
            try {
                val newGames = AdminRepository.getGamesPaged(
                    page = page,
                    search = state.searchQuery.trim(),
                    visibility = state.selectedVisibility,
                    status = state.selectedStatus
                )

                val reachedEnd = newGames.size < AdminRepository.PAGE_SIZE

                _uiState.update { current ->
                    current.copy(
                        games = if (append) current.games + newGames else newGames,
                        isLoading = false,
                        isLoadingMore = false,
                        hasReachedEnd = reachedEnd,
                        currentPage = page,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        isLoadingMore = false,
                        error = NetworkErrorHandler.getUiMessage(e, "Failed to load games.")
                    )
                }
            }
        }
    }
}
