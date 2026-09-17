package com.gamerbhidu.admin.ui.screens.login

import android.content.Context
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.util.BiometricHelper
import com.gamerbhidu.admin.util.NetworkErrorHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

enum class LoginStep {
    EMAIL,
    PASSWORD
}

data class LoginUiState(
    val step: LoginStep = LoginStep.EMAIL,
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false,
    val isBiometricAvailable: Boolean = false,
    val canBiometricUnlock: Boolean = false
)

class LoginViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    fun checkBiometricStatus(context: Context) {
        val available = BiometricHelper.isBiometricAvailable(context)
        val ready = BiometricHelper.isBiometricUnlockReady(context)
        _uiState.value = _uiState.value.copy(
            isBiometricAvailable = available,
            canBiometricUnlock = ready
        )
    }

    fun onEmailChange(value: String) {
        _uiState.value = _uiState.value.copy(email = value, error = null)
    }

    fun onPasswordChange(value: String) {
        _uiState.value = _uiState.value.copy(password = value, error = null)
    }

    fun proceedToPassword(): Boolean {
        val email = _uiState.value.email.trim()
        if (email.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please enter your email address.")
            return false
        }
        if (!email.contains("@") || !email.contains(".")) {
            _uiState.value = _uiState.value.copy(error = "Please enter a valid email address.")
            return false
        }
        _uiState.value = _uiState.value.copy(step = LoginStep.PASSWORD, error = null)
        return true
    }

    fun backToEmail() {
        _uiState.value = _uiState.value.copy(step = LoginStep.EMAIL, error = null)
    }

    fun signIn(context: Context? = null) {
        val state = _uiState.value
        if (state.email.isBlank()) {
            _uiState.value = state.copy(step = LoginStep.EMAIL, error = "Please enter your email.")
            return
        }
        if (state.password.isBlank()) {
            _uiState.value = state.copy(error = "Please enter your password.")
            return
        }
        _uiState.value = state.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                AdminRepository.signIn(state.email.trim(), state.password)
                // If context provided, save credentials for subsequent biometric unlock
                if (context != null && BiometricHelper.isBiometricAvailable(context)) {
                    BiometricHelper.saveCredentials(context, state.email.trim(), state.password)
                }
                _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = NetworkErrorHandler.getUiMessage(e, "Authentication failed. Check your credentials.")
                )
            }
        }
    }

    fun signInWithBiometrics(activity: FragmentActivity) {
        val creds = BiometricHelper.getSavedCredentials(activity)
        if (creds == null) {
            _uiState.value = _uiState.value.copy(error = "No biometric credentials saved. Log in with password first.")
            return
        }

        BiometricHelper.showPrompt(
            activity = activity,
            onSuccess = {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
                viewModelScope.launch {
                    try {
                        AdminRepository.signIn(creds.first, creds.second)
                        _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
                    } catch (e: Exception) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = NetworkErrorHandler.getUiMessage(e, "Biometric sign-in failed. Please enter password.")
                        )
                    }
                }
            },
            onError = { errMsg ->
                _uiState.value = _uiState.value.copy(error = errMsg)
            }
        )
    }
}
