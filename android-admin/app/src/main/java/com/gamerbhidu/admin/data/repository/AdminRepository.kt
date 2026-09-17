package com.gamerbhidu.admin.data.repository

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream
import com.gamerbhidu.admin.GamerBhiduAdminApp
import com.gamerbhidu.admin.data.model.*
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import io.github.jan.supabase.storage.storage
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.android.Android
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.booleanOrNull

/**
 * Central repository that handles all data operations.
 * Communicates directly with Supabase — same backend as the website.
 */
object AdminRepository {

    private val supabase get() = GamerBhiduAdminApp.supabase

    // ------------- AUTH -------------

    /** Sign in with email and password (same credentials as the website admin login) */
    suspend fun signIn(email: String, password: String) {
        supabase.auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
    }

    /** Sign out and clear the session */
    suspend fun signOut() {
        supabase.auth.signOut()
    }

    /** Check if there is an active session */
    fun isLoggedIn(): Boolean {
        return supabase.auth.currentSessionOrNull() != null
    }

    /** Get the current admin email */
    fun currentUserEmail(): String? {
        return supabase.auth.currentUserOrNull()?.email
    }

    // ------------- DASHBOARD -------------

    /** Load summary stats from the games and orders tables */
    suspend fun getDashboardStats(): DashboardStats {
        val totalRes = supabase.from("games").select(columns = Columns.list("id")) {
            count(Count.EXACT)
            limit(0)
        }
        val visibleRes = supabase.from("games").select(columns = Columns.list("id")) {
            count(Count.EXACT)
            limit(0)
            filter { eq("visible", true) }
        }
        val hiddenRes = supabase.from("games").select(columns = Columns.list("id")) {
            count(Count.EXACT)
            limit(0)
            filter { eq("visible", false) }
        }
        val upcomingRes = supabase.from("games").select(columns = Columns.list("id")) {
            count(Count.EXACT)
            limit(0)
            filter { eq("release_status", "upcoming") }
        }
        val socialProofsRes = runCatching {
            supabase.from("social_proofs").select(columns = Columns.list("id")) {
                count(Count.EXACT)
                limit(0)
            }
        }.getOrNull()
        val totalOrdersRes = runCatching {
            supabase.from("orders").select(columns = Columns.list("order_id")) {
                count(Count.EXACT)
                limit(0)
            }
        }.getOrNull()
        val pendingOrdersRes = runCatching {
            supabase.from("orders").select(columns = Columns.list("order_id")) {
                count(Count.EXACT)
                limit(0)
            }
        }.getOrNull()

        return DashboardStats(
            total = totalRes.countOrNull()?.toInt() ?: 0,
            visible = visibleRes.countOrNull()?.toInt() ?: 0,
            hidden = hiddenRes.countOrNull()?.toInt() ?: 0,
            upcoming = upcomingRes.countOrNull()?.toInt() ?: 0,
            socialProofs = socialProofsRes?.countOrNull()?.toInt() ?: 0,
            pendingOrders = pendingOrdersRes?.countOrNull()?.toInt() ?: 0,
            totalOrders = totalOrdersRes?.countOrNull()?.toInt() ?: 0
        )
    }

    /** Fetch the latest customer orders for the live operations queue */
    suspend fun getRecentOrders(limit: Long = 5): List<Order> {
        return supabase.from("orders")
            .select {
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(limit)
            }
            .decodeList<Order>()
    }

    /**
     * Fetch the 10 most-recently added games from Supabase,
     * mapped to [RecentActivity] with [ActivityAction.ADDED].
     * The relative "time ago" string is computed from the `created_at` timestamp.
     */
    suspend fun getRecentActivity(): List<com.gamerbhidu.admin.data.model.RecentActivity> {
        val games = supabase.from("games")
            .select {
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(10)
            }
            .decodeList<Game>()

        return games.map { game ->
            val statusLabel = when {
                game.releaseStatus == "upcoming" -> "Upcoming"
                !game.visible -> "Hidden"
                else -> "Visible"
            }
            com.gamerbhidu.admin.data.model.RecentActivity(
                gameTitle = game.title,
                actionType = com.gamerbhidu.admin.data.model.ActivityAction.ADDED,
                timeAgo = formatTimeAgo(game.createdAt),
                imageUrl = game.imageUrl,
                statusLabel = statusLabel,
                releaseStatus = game.releaseStatus,
                isVisible = game.visible
            )
        }
    }

    /** Convert an ISO-8601 timestamp string to a human-readable "X ago" label. */
    fun formatTimeAgo(isoTimestamp: String?): String {
        if (isoTimestamp == null) return "Recently"
        return try {
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US)
            sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
            val date = sdf.parse(isoTimestamp.substringBefore(".")) ?: return "Recently"
            val diffMs = System.currentTimeMillis() - date.time
            val diffMin = diffMs / 60_000
            val diffHr = diffMin / 60
            val diffDay = diffHr / 24
            when {
                diffMin < 1 -> "Just now"
                diffMin < 60 -> "${diffMin}m ago"
                diffHr < 24 -> "${diffHr}h ago"
                diffDay < 7 -> "${diffDay}d ago"
                else -> "${diffDay / 7}w ago"
            }
        } catch (e: Exception) {
            "Recently"
        }
    }


    // ------------- GAMES CRUD -------------

    const val PAGE_SIZE = 30

    /**
     * Fetch a single page of games with optional server-side filters.
     * Only [PAGE_SIZE] rows are fetched per call — never the full catalog.
     *
     * @param page       0-based page index
     * @param search     title search string (empty = no filter)
     * @param visibility "all" | "visible" | "hidden"
     * @param status     "all" | "released" | "upcoming"
     */
    suspend fun getGamesPaged(
        page: Int,
        search: String = "",
        visibility: String = "all",
        status: String = "all"
    ): List<Game> {
        val from = (page * PAGE_SIZE).toLong()
        val to = (from + PAGE_SIZE - 1)
        return supabase.from("games")
            .select {
                order("title", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                range(from, to)
                filter {
                    if (search.isNotBlank()) {
                        ilike("title", "%$search%")
                    }
                    when (visibility) {
                        "visible" -> eq("visible", true)
                        "hidden"  -> eq("visible", false)
                    }
                    when (status) {
                        "released" -> eq("release_status", "released")
                        "upcoming" -> eq("release_status", "upcoming")
                    }
                }
            }
            .decodeList()
    }

    /** Keep the old full-fetch for Dashboard stats (count only, no images needed) */
    suspend fun getGames(): List<Game> {
        return supabase.from("games")
            .select {
                order("title", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList()
    }

    /** Insert a new game */
    suspend fun addGame(game: Game): Game {
        return supabase.from("games").insert(game) { select() }.decodeSingle()
    }

    /** Update an existing game by ID */
    suspend fun updateGame(id: String, game: Game) {
        supabase.from("games").update(game) {
            filter { eq("id", id) }
        }
    }

    /** Delete a game by ID */
    suspend fun deleteGame(id: String) {
        supabase.from("games").delete {
            filter { eq("id", id) }
        }
    }

    /** Toggle a game's visibility */
    suspend fun toggleGameVisibility(id: String, visible: Boolean) {
        supabase.from("games").update(mapOf("visible" to visible)) {
            filter { eq("id", id) }
        }
    }

    // ------------- HOMEPAGE SECTIONS -------------

    /** Get a section's ID by its slug */
    suspend fun getSectionIdBySlug(slug: String): String? {
        return supabase.from("homepage_sections")
            .select(columns = Columns.list("id")) {
                filter { eq("slug", slug) }
                limit(1)
            }
            .decodeList<Map<String, String>>()
            .firstOrNull()
            ?.get("id")
    }

    /** Add a game to a homepage section */
    suspend fun addGameToSection(gameId: String, sectionSlug: String) {
        val sectionId = getSectionIdBySlug(sectionSlug) ?: return
        // Check if already exists
        val existing = supabase.from("section_games")
            .select(columns = Columns.list("id")) {
                filter {
                    eq("section_id", sectionId)
                    eq("game_id", gameId)
                }
                limit(1)
            }
            .decodeList<Map<String, String>>()
        if (existing.isNotEmpty()) return
        // Get max display_order
        val maxOrder = supabase.from("section_games")
            .select(columns = Columns.list("display_order")) {
                filter { eq("section_id", sectionId) }
                order("display_order", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(1)
            }
            .decodeList<Map<String, Int>>()
            .firstOrNull()
            ?.get("display_order") ?: 0
        supabase.from("section_games").insert(
            SectionGame(
                sectionId = sectionId,
                gameId = gameId,
                displayOrder = maxOrder + 10
            )
        )
    }

    /** Remove a game from a homepage section */
    suspend fun removeGameFromSection(gameId: String, sectionSlug: String) {
        val sectionId = getSectionIdBySlug(sectionSlug) ?: return
        supabase.from("section_games").delete {
            filter {
                eq("section_id", sectionId)
                eq("game_id", gameId)
            }
        }
    }

    /** Sync homepage sections based on release_status (mirrors website logic) */
    suspend fun syncHomepageSectionsForGame(
        gameId: String,
        status: String,
        isNew: Boolean = false,
        previousStatus: String? = null
    ) {
        if (status == "upcoming") {
            addGameToSection(gameId, "upcoming-games")
            runCatching { removeGameFromSection(gameId, "recently-launched") }
            runCatching { removeGameFromSection(gameId, "hot-deals") }
            return
        }
        // Released
        runCatching { removeGameFromSection(gameId, "upcoming-games") }
        if (isNew || previousStatus == "upcoming") {
            addGameToSection(gameId, "recently-launched")
        }
    }

    // ------------- STORAGE (Image Upload) -------------

    /**
     * Upload a game thumbnail to Supabase Storage.
     * Uses the same bucket and folder as the website: document-uploads/game-thumbnails/
     */
    suspend fun uploadGameImage(context: Context, uri: Uri): String {
        val inputStream = context.contentResolver.openInputStream(uri)
            ?: throw Exception("Could not open image file")
        val bytes = inputStream.readBytes()
        inputStream.close()

        val ext = context.contentResolver.getType(uri)?.substringAfter("/") ?: "jpg"
        val fileName = "${System.currentTimeMillis()}-${(0..999).random()}.$ext"
        val filePath = "game-thumbnails/$fileName"

        supabase.storage.from("document-uploads").upload(filePath, bytes, upsert = false)

        return supabase.storage.from("document-uploads").publicUrl(filePath)
    }

    // ------------- STEAM AUTOFILL -------------

    private val ktorClient = HttpClient(Android) {
        install(ContentNegotiation) {
            json(GamerBhiduAdminApp.json)
        }
    }

    /**
     * Fetch game details from the Steam Store API by App ID.
     * Returns title, description, genres, and header image URL.
     */
    suspend fun fetchSteamDetails(appId: String): SteamAppData? {
        val url = "https://store.steampowered.com/api/appdetails?appids=$appId&cc=in&l=english"
        val response: JsonObject = ktorClient.get(url).body()
        val appData = response[appId]?.jsonObject ?: return null
        val json = GamerBhiduAdminApp.json
        return try {
            json.decodeFromJsonElement(SteamAppResponse.serializer(), appData).data
        } catch (e: Exception) {
            null
        }
    }

    // ------------- SOCIAL PROOFS -------------
 
    suspend fun getSocialProofs(): List<SocialProof> {
        return supabase.from("social_proofs")
            .select {
                order("display_order", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList()
    }

    suspend fun addSocialProof(proof: SocialProof): SocialProof {
        val maxOrder = supabase.from("social_proofs")
            .select(columns = Columns.list("display_order")) {
                order("display_order", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(1)
            }
            .decodeList<Map<String, Int>>()
            .firstOrNull()
            ?.get("display_order") ?: 0

        val toInsert = proof.copy(displayOrder = maxOrder + 1)
        return supabase.from("social_proofs").insert(toInsert) { select() }.decodeSingle()
    }

    suspend fun toggleSocialProofVisibility(id: String, visible: Boolean) {
        supabase.from("social_proofs").update(mapOf("visible" to visible)) {
            filter { eq("id", id) }
        }
    }

    private fun extractProofStoragePath(url: String): String? {
        val marker = "/document-uploads/"
        val idx = url.indexOf(marker)
        if (idx == -1) return null
        val path = url.substring(idx + marker.length).substringBefore("?")
        return if (path.startsWith("proof-images/")) path else null
    }

    suspend fun deleteSocialProof(id: String, imageUrl: String? = null) {
        supabase.from("social_proofs").delete {
            filter { eq("id", id) }
        }
        if (!imageUrl.isNullOrBlank()) {
            val storagePath = extractProofStoragePath(imageUrl)
            if (storagePath != null) {
                runCatching {
                    supabase.storage.from("document-uploads").delete(storagePath)
                }
            }
        }
    }

    /**
     * Uploads a social proof screenshot to Supabase Storage with optimized, visually lossless quality.
     * Preserves crisp receipt/chat text while avoiding oversized file payloads.
     */
    suspend fun uploadSocialProofImage(context: Context, uri: Uri): String {
        val rawBytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
            ?: throw Exception("Could not open image file")

        val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
        val isPng = mimeType.contains("png", ignoreCase = true)

        val processedBytes: ByteArray = try {
            val boundsOptions = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(rawBytes, 0, rawBytes.size, boundsOptions)
            val origWidth = boundsOptions.outWidth
            val origHeight = boundsOptions.outHeight

            // If <= 2MB and dimension <= 2048, use original bytes directly for 100% untouched pixel fidelity
            if (rawBytes.size <= 2 * 1024 * 1024 && origWidth in 1..2048 && origHeight in 1..2048) {
                rawBytes
            } else if (origWidth > 0 && origHeight > 0) {
                val maxDim = 2048
                var sampleSize = 1
                while ((origWidth / sampleSize) > maxDim * 2 || (origHeight / sampleSize) > maxDim * 2) {
                    sampleSize *= 2
                }
                val decodeOptions = BitmapFactory.Options().apply { inSampleSize = sampleSize }
                val bitmap = BitmapFactory.decodeByteArray(rawBytes, 0, rawBytes.size, decodeOptions)

                if (bitmap != null) {
                    val scale = if (bitmap.width > maxDim || bitmap.height > maxDim) {
                        minOf(maxDim.toFloat() / bitmap.width, maxDim.toFloat() / bitmap.height)
                    } else 1f

                    val scaledBitmap = if (scale < 1f) {
                        val targetW = (bitmap.width * scale).toInt()
                        val targetH = (bitmap.height * scale).toInt()
                        Bitmap.createScaledBitmap(bitmap, targetW, targetH, true).also {
                            if (it != bitmap) bitmap.recycle()
                        }
                    } else {
                        bitmap
                    }

                    val bos = ByteArrayOutputStream()
                    if (isPng) {
                        scaledBitmap.compress(Bitmap.CompressFormat.PNG, 100, bos)
                    } else {
                        // 95% JPEG preserves tack-sharp text with virtually no visual loss
                        scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 95, bos)
                    }
                    scaledBitmap.recycle()
                    bos.toByteArray()
                } else {
                    rawBytes
                }
            } else {
                rawBytes
            }
        } catch (e: Exception) {
            rawBytes
        }

        val ext = if (isPng) "png" else "jpg"
        val fileName = "${System.currentTimeMillis()}-${(0..999).random()}.$ext"
        val filePath = "proof-images/$fileName"

        supabase.storage.from("document-uploads").upload(filePath, processedBytes, upsert = false)
        return supabase.storage.from("document-uploads").publicUrl(filePath)
    }

    // ------------- ORDERS & VERIFICATION -------------

    /**
     * Fetch all orders, with client-side status and text search filtering.
     */
    suspend fun getOrders(
        deliveryStatus: String = "all",
        search: String = ""
    ): List<Order> {
        val all = supabase.from("orders")
            .select {
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
            }
            .decodeList<Order>()

        return all.filter { order ->
            val matchesStatus = when (deliveryStatus) {
                "pending" -> order.deliveryStatus.equals("pending", ignoreCase = true)
                "delivered" -> order.deliveryStatus.equals("delivered", ignoreCase = true)
                else -> true
            }
            val matchesSearch = if (search.isBlank()) true else {
                order.orderCode.contains(search, ignoreCase = true) ||
                order.orderId.contains(search, ignoreCase = true) ||
                order.customerEmail.contains(search, ignoreCase = true) ||
                order.customerName.contains(search, ignoreCase = true) ||
                order.utrNumber.contains(search, ignoreCase = true) ||
                order.items.any { it.name.contains(search, ignoreCase = true) }
            }
            matchesStatus && matchesSearch
        }
    }

    /**
     * Verify an order by WhatsApp bill code (e.g. GB-8492 or 8492) or UTR number.
     * Computes the recurring customer's lifetime purchase history dossier.
     */
    suspend fun verifyOrderCode(rawQuery: String): OrderVerificationResult? {
        val query = rawQuery.trim().uppercase()
        val cleanCode = if (query.startsWith("GB-")) query else "GB-$query"

        val allOrders = supabase.from("orders")
            .select {
                order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
            }
            .decodeList<Order>()

        val matchedOrder = allOrders.firstOrNull { order ->
            order.orderCode.equals(cleanCode, ignoreCase = true) ||
            order.orderCode.equals(query, ignoreCase = true) ||
            order.orderId.equals(query, ignoreCase = true) ||
            (order.utrNumber.isNotBlank() && order.utrNumber.equals(query, ignoreCase = true))
        } ?: return null

        val customerEmail = matchedOrder.customerEmail.trim()
        val customerOrders = if (customerEmail.isNotBlank()) {
            allOrders.filter { it.customerEmail.equals(customerEmail, ignoreCase = true) }
        } else {
            listOf(matchedOrder)
        }

        val totalSpent = customerOrders.sumOf { it.total }
        val dossier = CustomerDossier(
            totalOrders = customerOrders.size,
            totalSpent = totalSpent,
            isRecurring = customerOrders.size > 1,
            pastOrders = customerOrders
        )

        return OrderVerificationResult(
            order = matchedOrder,
            dossier = dossier
        )
    }

    /**
     * Updates delivery status (pending / delivered) and records admin manual delivery notes.
     */
    suspend fun updateOrderDelivery(orderId: String, deliveryStatus: String, deliveryNotes: String) {
        val status = if (deliveryStatus == "delivered") "delivered" else "pending"
        val nowIso = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }.format(java.util.Date())

        supabase.from("orders").update(
            mapOf(
                "delivery_status" to deliveryStatus,
                "status" to status,
                "delivery_notes" to deliveryNotes,
                "updated_at" to nowIso
            )
        ) {
            filter {
                eq("order_id", orderId)
            }
        }
    }

    // ------------- HOMEPAGE SECTIONS MANAGER -------------

    /** Fetch all homepage sections ordered by display_order */
    suspend fun getSections(): List<HomepageSection> {
        return supabase.from("homepage_sections")
            .select {
                order("display_order", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList()
    }

    /**
     * Fetch all section_games for a given section, enriched with game fields.
     * Uses raw JSON decoding because the Supabase Kotlin SDK's nested decodeList
     * doesn't automatically handle multi-level embedded relationships.
     */
    suspend fun getSectionGames(sectionId: String): List<SectionGameWithGame> {
        val raw = supabase.from("section_games")
            .select(Columns.raw("id, game_id, display_order, games(id, title, image_url, selling_price, visible, release_status)")) {
                filter { eq("section_id", sectionId) }
                order("display_order", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList<kotlinx.serialization.json.JsonObject>()

        return raw.mapNotNull { obj ->
            val sgId = obj["id"]?.jsonPrimitive?.content ?: return@mapNotNull null
            val gameId = obj["game_id"]?.jsonPrimitive?.content ?: return@mapNotNull null
            val displayOrder = obj["display_order"]?.jsonPrimitive?.content?.toIntOrNull() ?: 0
            val gameObj = obj["games"]?.jsonObject ?: return@mapNotNull null
            SectionGameWithGame(
                sectionGameId = sgId,
                gameId = gameId,
                title = gameObj["title"]?.jsonPrimitive?.content ?: "",
                imageUrl = gameObj["image_url"]?.jsonPrimitive?.content ?: "",
                sellingPrice = gameObj["selling_price"]?.jsonPrimitive?.doubleOrNull,
                visible = gameObj["visible"]?.jsonPrimitive?.booleanOrNull ?: true,
                releaseStatus = gameObj["release_status"]?.jsonPrimitive?.content ?: "released",
                displayOrder = displayOrder
            )
        }
    }

    /**
     * Fetch all visible games as lightweight picker entries (id + title + image_url only).
     * Used by the game picker bottom sheet in the Homepage Sections Manager.
     */
    suspend fun getAllVisibleGames(): List<Game> {
        return supabase.from("games")
            .select {
                filter { eq("visible", true) }
                order("title", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList()
    }

    /** Add a game to a homepage section by direct IDs. */
    suspend fun addGameToSectionById(sectionId: String, gameId: String) {
        // Check if already exists
        val existing = supabase.from("section_games")
            .select(Columns.list("id")) {
                filter {
                    eq("section_id", sectionId)
                    eq("game_id", gameId)
                }
                limit(1)
            }
            .decodeList<Map<String, String>>()
        if (existing.isNotEmpty()) return

        // Get max display_order for this section
        val maxOrder = supabase.from("section_games")
            .select(Columns.list("display_order")) {
                filter { eq("section_id", sectionId) }
                order("display_order", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(1)
            }
            .decodeList<Map<String, Int>>()
            .firstOrNull()
            ?.get("display_order") ?: 0

        supabase.from("section_games").insert(
            SectionGame(
                sectionId = sectionId,
                gameId = gameId,
                displayOrder = maxOrder + 10
            )
        )
    }

    /** Remove a game from a section using the section_games row ID. */
    suspend fun removeGameFromSectionById(sectionGameId: String) {
        supabase.from("section_games").delete {
            filter { eq("id", sectionGameId) }
        }
    }

    /**
     * Batch-update display_order for section games after a reorder.
     * @param updates list of (sectionGameId, newOrder) pairs
     */
    suspend fun reorderSectionGames(updates: List<Pair<String, Int>>) {
        updates.forEach { (id, order) ->
            supabase.from("section_games").update(mapOf("display_order" to order)) {
                filter { eq("id", id) }
            }
        }
    }

    // ------------- COMBOS MANAGER -------------

    /** Fetch all combos ordered by display_order */
    suspend fun getCombos(): List<Combo> {
        return supabase.from("combos")
            .select {
                order("display_order", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList()
    }

    /**
     * Fetch combo_games for a given combo, enriched with game display data.
     */
    suspend fun getComboGames(comboId: String): List<ComboGameDetail> {
        val raw = supabase.from("combo_games")
            .select(Columns.raw("id, game_id, display_order, games(id, title, image_url, selling_price)")) {
                filter { eq("combo_id", comboId) }
                order("display_order", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
            }
            .decodeList<kotlinx.serialization.json.JsonObject>()

        return raw.mapNotNull { obj ->
            val cgId = obj["id"]?.jsonPrimitive?.content ?: return@mapNotNull null
            val gameId = obj["game_id"]?.jsonPrimitive?.content ?: return@mapNotNull null
            val gameObj = obj["games"]?.jsonObject ?: return@mapNotNull null
            ComboGameDetail(
                comboGameId = cgId,
                gameId = gameId,
                title = gameObj["title"]?.jsonPrimitive?.content ?: "",
                imageUrl = gameObj["image_url"]?.jsonPrimitive?.content ?: "",
                sellingPrice = gameObj["selling_price"]?.jsonPrimitive?.doubleOrNull
            )
        }
    }

    /** Insert a new combo and return it with its generated ID */
    suspend fun addCombo(combo: Combo): Combo {
        return supabase.from("combos").insert(combo) { select() }.decodeSingle()
    }

    /** Update an existing combo by ID */
    suspend fun updateCombo(id: String, combo: Combo) {
        supabase.from("combos").update(combo) {
            filter { eq("id", id) }
        }
    }

    /** Delete a combo by ID (combo_games are deleted by DB cascade) */
    suspend fun deleteCombo(id: String) {
        supabase.from("combos").delete {
            filter { eq("id", id) }
        }
    }

    /** Toggle a combo's visibility */
    suspend fun toggleComboVisibility(id: String, visible: Boolean) {
        supabase.from("combos").update(mapOf("visible" to visible)) {
            filter { eq("id", id) }
        }
    }

    /** Add a game to a combo */
    suspend fun addGameToCombo(comboId: String, gameId: String) {
        // Check if already in combo
        val existing = supabase.from("combo_games")
            .select(Columns.list("id")) {
                filter {
                    eq("combo_id", comboId)
                    eq("game_id", gameId)
                }
                limit(1)
            }
            .decodeList<Map<String, String>>()
        if (existing.isNotEmpty()) return

        val maxOrder = supabase.from("combo_games")
            .select(Columns.list("display_order")) {
                filter { eq("combo_id", comboId) }
                order("display_order", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                limit(1)
            }
            .decodeList<Map<String, Int>>()
            .firstOrNull()
            ?.get("display_order") ?: 0

        supabase.from("combo_games").insert(
            ComboGame(
                comboId = comboId,
                gameId = gameId,
                displayOrder = maxOrder + 10
            )
        )
    }

    /** Remove a game from a combo using the combo_games row ID */
    suspend fun removeGameFromCombo(comboGameId: String) {
        supabase.from("combo_games").delete {
            filter { eq("id", comboGameId) }
        }
    }
}

