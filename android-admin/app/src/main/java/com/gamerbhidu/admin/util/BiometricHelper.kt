package com.gamerbhidu.admin.util

import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Biometric authentication & hardware-encrypted credential helper.
 * Supports fingerprint, face unlock, and device credentials (PIN/Pattern).
 */
object BiometricHelper {

    private const val PREFS_NAME = "gamerbhidu_secure_admin_prefs"
    private const val KEY_EMAIL = "secure_admin_email"
    private const val KEY_PASSWORD = "secure_admin_password"
    private const val KEY_BIOMETRIC_ENABLED = "secure_biometric_enabled"

    private fun getEncryptedPrefs(context: Context) = try {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        null
    }

    /**
     * Checks whether biometric authentication (Fingerprint, Face, or Device PIN) is supported & enrolled.
     */
    fun isBiometricAvailable(context: Context): Boolean {
        val manager = BiometricManager.from(context)
        val authenticators = BiometricManager.Authenticators.BIOMETRIC_STRONG or
                BiometricManager.Authenticators.BIOMETRIC_WEAK or
                BiometricManager.Authenticators.DEVICE_CREDENTIAL
        val canAuth = manager.canAuthenticate(authenticators)
        return canAuth == BiometricManager.BIOMETRIC_SUCCESS
    }

    /**
     * Checks whether biometric unlock is enabled and credentials are saved.
     */
    fun isBiometricUnlockReady(context: Context): Boolean {
        if (!isBiometricAvailable(context)) return false
        val prefs = getEncryptedPrefs(context) ?: return false
        val email = prefs.getString(KEY_EMAIL, null)
        val password = prefs.getString(KEY_PASSWORD, null)
        val isEnabled = prefs.getBoolean(KEY_BIOMETRIC_ENABLED, false)
        return isEnabled && !email.isNullOrBlank() && !password.isNullOrBlank()
    }

    /**
     * Saves credentials securely for biometric unlock.
     */
    fun saveCredentials(context: Context, email: String, password: String) {
        val prefs = getEncryptedPrefs(context) ?: return
        prefs.edit()
            .putString(KEY_EMAIL, email.trim())
            .putString(KEY_PASSWORD, password)
            .putBoolean(KEY_BIOMETRIC_ENABLED, true)
            .apply()
    }

    /**
     * Retrieves saved credentials.
     */
    fun getSavedCredentials(context: Context): Pair<String, String>? {
        val prefs = getEncryptedPrefs(context) ?: return null
        val email = prefs.getString(KEY_EMAIL, null) ?: return null
        val password = prefs.getString(KEY_PASSWORD, null) ?: return null
        return Pair(email, password)
    }

    /**
     * Clears credentials on explicit sign-out.
     */
    fun clearCredentials(context: Context) {
        val prefs = getEncryptedPrefs(context) ?: return
        prefs.edit().clear().apply()
    }

    /**
     * Shows system biometric prompt and invokes callbacks on completion.
     */
    fun showPrompt(
        activity: FragmentActivity,
        title: String = "Unlock GamerBhidu Admin",
        subtitle: String = "Confirm your fingerprint or face to proceed",
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)

        val callback = object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                if (errorCode != BiometricPrompt.ERROR_USER_CANCELED &&
                    errorCode != BiometricPrompt.ERROR_NEGATIVE_BUTTON
                ) {
                    onError(errString.toString())
                }
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onError("Biometric not recognized. Please try again.")
            }
        }

        val prompt = BiometricPrompt(activity, executor, callback)

        val promptInfoBuilder = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)

        // Try DEVICE_CREDENTIAL with BIOMETRIC_STRONG, or fallback to negative button
        try {
            promptInfoBuilder.setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG or
                        BiometricManager.Authenticators.DEVICE_CREDENTIAL
            )
        } catch (e: Exception) {
            promptInfoBuilder.setNegativeButtonText("Use Password")
        }

        prompt.authenticate(promptInfoBuilder.build())
    }
}
