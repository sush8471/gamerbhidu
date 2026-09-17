package com.gamerbhidu.admin.util

import android.content.Context
import android.widget.Toast

/**
 * Clean helper for user feedback toasts across the Admin app.
 */
object ToastUtils {

    fun showSuccess(context: Context, message: String) {
        Toast.makeText(context, "✓ $message", Toast.LENGTH_SHORT).show()
    }

    fun showError(context: Context, message: String) {
        Toast.makeText(context, "⚠️ $message", Toast.LENGTH_LONG).show()
    }

    fun showInfo(context: Context, message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
