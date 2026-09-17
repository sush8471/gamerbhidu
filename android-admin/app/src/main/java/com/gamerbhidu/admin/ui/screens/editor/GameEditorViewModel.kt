package com.gamerbhidu.admin.ui.screens.editor

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.model.Game
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.NetworkErrorHandler
import com.gamerbhidu.admin.util.ToastUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

data class GameEditorUiState(
    // Form fields (all strings for easier text input handling)
    val title: String = "",
    val slug: String = "",
    val imageUrl: String = "",
    val sellingPrice: String = "",
    val originalPrice: String = "",
    val discountPercentage: String = "",
    val genre: String = "",
    val series: String = "",
    val description: String = "",
    val releaseStatus: String = "released",
    val visible: Boolean = true,
    val steamAppId: String = "",

    // UI state
    val isLoading: Boolean = false,
    val isEditMode: Boolean = false,
    val existingGameId: String? = null,
    val previousStatus: String? = null,
    val error: String? = null,
    val isSaved: Boolean = false,

    // Steam fetch state
    val isFetchingSteam: Boolean = false,
    val steamFetchedTags: List<String> = emptyList(),

    // Image upload state
    val isUploadingImage: Boolean = false
)

class GameEditorViewModel(private val gameId: String?) : ViewModel() {

    private val _uiState = MutableStateFlow(GameEditorUiState())
    val uiState: StateFlow<GameEditorUiState> = _uiState

    init {
        if (gameId != null) {
            loadExistingGame(gameId)
        }
    }

    private fun loadExistingGame(id: String) {
        _uiState.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            try {
                val games = AdminRepository.getGames()
                val game = games.firstOrNull { it.id == id }
                if (game != null) {
                    _uiState.update {
                        it.copy(
                            title = game.title,
                            slug = game.slug,
                            imageUrl = game.imageUrl,
                            sellingPrice = game.sellingPrice?.toString() ?: "",
                            originalPrice = game.originalPrice?.toString() ?: "",
                            discountPercentage = game.discountPercentage?.toString() ?: "",
                            genre = game.genre.joinToString(", "),
                            series = game.series ?: "",
                            description = game.description ?: "",
                            releaseStatus = game.releaseStatus,
                            visible = game.visible,
                            steamAppId = game.steamAppId?.toString() ?: "",
                            isEditMode = true,
                            existingGameId = id,
                            previousStatus = game.releaseStatus,
                            isLoading = false
                        )
                    }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "Game not found.") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to load game.")) }
            }
        }
    }

    // ── Field updaters ────────────────────────────────────────────────────────

    fun onTitleChange(value: String) {
        _uiState.update { state ->
            val slug = if (!state.isEditMode) {
                value.lowercase().trim()
                    .replace(Regex("[^\\w\\s-]"), "")
                    .replace(Regex("\\s+"), "-")
                    .replace(Regex("-+"), "-")
            } else state.slug
            state.copy(title = value, slug = slug, error = null)
        }
    }

    fun onSlugChange(v: String) = _uiState.update { it.copy(slug = v, error = null) }
    fun onImageUrlChange(v: String) = _uiState.update { it.copy(imageUrl = v, error = null) }
    fun onGenreChange(v: String) = _uiState.update { it.copy(genre = v, error = null) }
    fun onSeriesChange(v: String) = _uiState.update { it.copy(series = v) }
    fun onDescriptionChange(v: String) = _uiState.update { it.copy(description = v) }
    fun onVisibleChange(v: Boolean) = _uiState.update { it.copy(visible = v) }
    fun onReleaseStatusChange(v: String) = _uiState.update { it.copy(releaseStatus = v) }
    fun onSteamAppIdChange(v: String) = _uiState.update { it.copy(steamAppId = v, error = null) }
    fun clearError() = _uiState.update { it.copy(error = null) }

    fun onSellingPriceChange(v: String) {
        _uiState.update { state ->
            val discount = calcDiscount(v, state.originalPrice)
            state.copy(sellingPrice = v, discountPercentage = discount, error = null)
        }
    }

    fun onOriginalPriceChange(v: String) {
        _uiState.update { state ->
            val discount = calcDiscount(state.sellingPrice, v)
            state.copy(originalPrice = v, discountPercentage = discount, error = null)
        }
    }

    private fun calcDiscount(selling: String, original: String): String {
        val sell = selling.toDoubleOrNull() ?: return ""
        val orig = original.toDoubleOrNull() ?: return ""
        if (orig <= 0) return ""
        val pct = ((orig - sell) / orig * 100).roundToInt()
        return if (pct > 0) pct.toString() else ""
    }

    // ── Steam autofill ────────────────────────────────────────────────────────

    fun fetchSteamDetails() {
        val appId = _uiState.value.steamAppId.trim()
        if (appId.isEmpty()) {
            _uiState.update { it.copy(error = "Please enter a Steam App ID first.") }
            return
        }
        _uiState.update { it.copy(isFetchingSteam = true, error = null) }
        viewModelScope.launch {
            try {
                val data = AdminRepository.fetchSteamDetails(appId)
                if (data != null) {
                    val title = data.name ?: ""
                    val slug = title.lowercase().trim()
                        .replace(Regex("[^\\w\\s-]"), "")
                        .replace(Regex("\\s+"), "-")
                        .replace(Regex("-+"), "-")
                    val genres = data.genres.joinToString(", ") { it.description }
                    val tags = listOf(title.lowercase()) + data.genres.map { it.description.lowercase() }
                    _uiState.update { state ->
                        state.copy(
                            title = title,
                            slug = slug,
                            genre = genres,
                            imageUrl = data.headerImage ?: state.imageUrl,
                            description = data.shortDescription ?: state.description,
                            steamFetchedTags = tags,
                            isFetchingSteam = false
                        )
                    }
                } else {
                    _uiState.update { it.copy(isFetchingSteam = false, error = "No data found for this Steam App ID.") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isFetchingSteam = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to fetch Steam details.")) }
            }
        }
    }

    // ── Image upload ──────────────────────────────────────────────────────────

    fun uploadImage(context: Context, uri: Uri) {
        _uiState.update { it.copy(isUploadingImage = true, error = null) }
        viewModelScope.launch {
            try {
                val url = AdminRepository.uploadGameImage(context, uri)
                _uiState.update { it.copy(imageUrl = url, isUploadingImage = false) }
                ToastUtils.showSuccess(context, "Game poster uploaded successfully!")
            } catch (e: Exception) {
                val errMsg = NetworkErrorHandler.getUiMessage(e, "Image upload failed.")
                _uiState.update { it.copy(isUploadingImage = false, error = errMsg) }
                ToastUtils.showError(context, errMsg)
            }
        }
    }

    // ── Save ──────────────────────────────────────────────────────────────────

    fun save() {
        val state = _uiState.value
        // Validation (mirrors website logic)
        if (state.title.isBlank()) { _uiState.update { it.copy(error = "Title is required.") }; return }
        if (state.slug.isBlank()) { _uiState.update { it.copy(error = "Slug is required.") }; return }
        if (state.imageUrl.isBlank()) { _uiState.update { it.copy(error = "Image URL/Poster is required.") }; return }
        if (state.genre.isBlank()) { _uiState.update { it.copy(error = "At least one genre is required.") }; return }
        if (!state.slug.matches(Regex("^[a-z0-9_-]+$"))) {
            _uiState.update { it.copy(error = "Slug must contain only lowercase letters, numbers, hyphens, and underscores.") }
            return
        }

        _uiState.update { it.copy(isLoading = true, error = null) }

        val tags = state.steamFetchedTags.ifEmpty {
            state.title.split(" ").map { it.lowercase() } +
                    state.genre.split(",").map { it.trim().lowercase() }
        }

        val game = Game(
            title = state.title.trim(),
            slug = state.slug.trim(),
            imageUrl = state.imageUrl.trim(),
            sellingPrice = state.sellingPrice.toDoubleOrNull(),
            originalPrice = state.originalPrice.toDoubleOrNull(),
            discountPercentage = state.discountPercentage.toIntOrNull(),
            genre = state.genre.split(",").map { it.trim() }.filter { it.isNotEmpty() },
            tags = tags,
            series = state.series.trim().ifBlank { null },
            description = state.description.trim().ifBlank { null },
            releaseStatus = state.releaseStatus,
            visible = state.visible,
            steamAppId = state.steamAppId.toLongOrNull()
        )

        viewModelScope.launch {
            try {
                if (state.isEditMode && state.existingGameId != null) {
                    AdminRepository.updateGame(state.existingGameId, game)
                    AdminRepository.syncHomepageSectionsForGame(
                        gameId = state.existingGameId,
                        status = state.releaseStatus,
                        previousStatus = state.previousStatus
                    )
                } else {
                    val saved = AdminRepository.addGame(game)
                    if (saved.id != null) {
                        AdminRepository.syncHomepageSectionsForGame(
                            gameId = saved.id,
                            status = state.releaseStatus,
                            isNew = true
                        )
                    }
                }
                _uiState.update { it.copy(isLoading = false, isSaved = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = NetworkErrorHandler.getUiMessage(e, "Failed to save game.")) }
            }
        }
    }

    class Factory(private val gameId: String?) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            GameEditorViewModel(gameId) as T
    }
}
