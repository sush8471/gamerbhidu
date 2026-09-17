package com.gamerbhidu.admin.util

import android.util.Log
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

/**
 * Centralised exception-to-user-message translator.
 *
 * RAW exception messages from Supabase/Ktor/OkHttp frequently contain:
 *   - The full project URL (e.g. "https://xyz.supabase.co/auth/v1/token")
 *   - Internal host-resolution details
 *   - Stack-trace fragments
 *
 * Exposing these strings in the UI is a security hygiene issue — they can
 * reveal infrastructure details to an attacker watching the screen or a
 * screenshot.  This object maps every known exception category to a
 * clean, user-friendly message and logs the real cause internally only.
 */
object NetworkErrorHandler {

    private const val TAG = "GBAdmin"

    /**
     * Returns a safe, user-facing error string.
     * The raw exception is logged at DEBUG level for developer diagnostics
     * but is never propagated to the UI.
     *
     * @param e          The caught exception.
     * @param fallback   Caller-specific fallback shown for unknown errors.
     */
    fun getUiMessage(e: Exception, fallback: String = "Something went wrong. Please try again."): String {
        // Log the real cause internally — never show it to the user.
        Log.d(TAG, "Handled error: ${e.javaClass.simpleName} — ${e.message}")

        val msg = e.message?.lowercase() ?: ""

        return when {
            // ── Network unavailable ──────────────────────────────────────────
            e is UnknownHostException
            || msg.contains("unable to resolve host")
            || msg.contains("no address associated")
            || msg.contains("failed to connect")
            -> "No internet connection. Please check your network and try again."

            // ── Connection refused / server unreachable ───────────────────────
            e is ConnectException
            || msg.contains("connection refused")
            || msg.contains("econnrefused")
            -> "Could not reach the server. Please try again later."

            // ── Timeout ───────────────────────────────────────────────────────
            e is SocketTimeoutException
            || msg.contains("timeout")
            || msg.contains("timed out")
            -> "The request timed out. Please check your connection and try again."

            // ── Auth / credential errors ───────────────────────────────────────
            msg.contains("invalid login credentials")
            || msg.contains("invalid_grant")
            || msg.contains("wrong password")
            || msg.contains("email not confirmed")
            -> "Incorrect email or password. Please try again."

            msg.contains("too many requests")
            || msg.contains("rate limit")
            -> "Too many attempts. Please wait a moment and try again."

            msg.contains("user not found")
            || msg.contains("no user found")
            -> "No account found with those credentials."

            // ── HTTP-level errors from Supabase/PostgREST ─────────────────────
            msg.contains("401") || msg.contains("unauthorized")
            -> "Session expired. Please sign in again."

            msg.contains("403") || msg.contains("forbidden")
            -> "You don't have permission to perform this action."

            msg.contains("404") || msg.contains("not found")
            -> "The requested resource was not found."

            msg.contains("409") || msg.contains("conflict")
            -> "A conflict occurred. The record may already exist."

            msg.contains("500") || msg.contains("internal server error")
            -> "Server error. Please try again later."

            msg.contains("503") || msg.contains("service unavailable")
            -> "Service temporarily unavailable. Please try again later."

            // ── SSL / Certificate ─────────────────────────────────────────────
            msg.contains("ssl") || msg.contains("certificate") || msg.contains("handshake")
            -> "Secure connection failed. Please check your network settings."

            // ── Serialization / data format ───────────────────────────────────
            msg.contains("jsondecodingexception")
            || msg.contains("serialization")
            || msg.contains("malformed")
            -> "Received unexpected data from the server. Please try again."

            // ── Storage (image upload) ────────────────────────────────────────
            msg.contains("storage")
            || msg.contains("bucket")
            || msg.contains("object")
            -> "File operation failed. Please try again."

            // ── Catch-all: return the developer-supplied fallback ─────────────
            else -> fallback
        }
    }
}
