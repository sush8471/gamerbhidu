package com.gamerbhidu.admin.util

/**
 * The production website domain where public catalog assets (e.g. /subnautica.jpg) are hosted.
 */
const val BASE_WEB_URL = "https://gamerbhidu.vercel.app"

/**
 * Resolves any game image URL into a fully-qualified, loadable HTTPS URL.
 *
 * Handles:
 *  - Relative paths stored from the website (e.g. "/subnautica.jpg" -> "https://gamerbhidu.vercel.app/subnautica.jpg")
 *  - Protocol-relative URLs (e.g. "//cdn.example.com/img.jpg" -> "https://cdn.example.com/img.jpg")
 *  - Insecure HTTP -> upgraded to HTTPS
 *  - Already absolute HTTPS URLs (Supabase Storage, Steam CDN, etc.) -> preserved directly
 */
fun resolveImageUrl(url: String?): String? {
    if (url.isNullOrBlank()) return null
    val trimmed = url.trim()
    return when {
        trimmed.startsWith("https://", ignoreCase = true) -> trimmed
        trimmed.startsWith("http://", ignoreCase = true) -> trimmed.replaceFirst("http://", "https://", ignoreCase = true)
        trimmed.startsWith("//") -> "https:$trimmed"
        trimmed.startsWith("/") -> "$BASE_WEB_URL$trimmed"
        else -> "$BASE_WEB_URL/$trimmed"
    }
}
