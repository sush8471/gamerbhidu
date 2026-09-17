package com.gamerbhidu.admin.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Mirrors the `games` table in Supabase — exactly the same schema as your website's DbGame type.
 * Any change saved in the app is instantly visible on the live gamerbhidu website.
 */
@Serializable
data class Game(
    val id: String? = null,
    val title: String,
    val slug: String,
    @SerialName("image_url") val imageUrl: String,
    @SerialName("selling_price") val sellingPrice: Double? = null,
    @SerialName("original_price") val originalPrice: Double? = null,
    @SerialName("discount_percentage") val discountPercentage: Int? = null,
    val genre: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val series: String? = null,
    val description: String? = null,
    @SerialName("release_status") val releaseStatus: String = "released",
    val visible: Boolean = true,
    @SerialName("steam_app_id") val steamAppId: Long? = null,
    @SerialName("created_at") val createdAt: String? = null
)

/**
 * Mirrors the `combos` table — bundle deals shown on the website homepage.
 * Column names match the real Supabase schema exactly.
 */
@Serializable
data class Combo(
    val id: String? = null,
    val title: String = "",
    val description: String? = null,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("original_price") val originalPrice: Double? = null,
    @SerialName("discounted_price") val discountedPrice: Double = 0.0,
    @SerialName("discount_details") val discountDetails: String? = null,
    @SerialName("curiosity_cue") val curiosityCue: String? = null,
    @SerialName("value_anchor") val valueAnchor: String? = null,
    @SerialName("display_order") val displayOrder: Int = 0,
    val visible: Boolean = true,
    @SerialName("deal_expires_at") val dealExpiresAt: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

/**
 * Mirrors the `combo_games` join table.
 * Links a combo to a game with an ordering position.
 */
@Serializable
data class ComboGame(
    val id: String? = null,
    @SerialName("combo_id") val comboId: String,
    @SerialName("game_id") val gameId: String,
    @SerialName("display_order") val displayOrder: Int = 0
)

/**
 * Enriched section game entry — section_games row joined with full game data.
 * Used by the Homepage Sections Manager screen.
 */
data class SectionGameWithGame(
    val sectionGameId: String,           // section_games.id (for removal)
    val gameId: String,
    val title: String,
    val imageUrl: String,
    val sellingPrice: Double?,
    val visible: Boolean,
    val releaseStatus: String,
    val displayOrder: Int
)

/**
 * Enriched combo entry — combo row plus its linked games.
 * Used by the Combos Manager screen.
 */
data class ComboWithGames(
    val combo: Combo,
    val games: List<ComboGameDetail> = emptyList()
)

/**
 * A game inside a combo with its full display data.
 */
data class ComboGameDetail(
    val comboGameId: String,   // combo_games.id (for removal)
    val gameId: String,
    val title: String,
    val imageUrl: String,
    val sellingPrice: Double?
)


/**
 * Mirrors the `homepage_sections` table — sections shown on the homepage.
 * The Supabase table column is `name`, so we map both `name` and `title` to avoid deserialization failure.
 */
@Serializable
data class HomepageSection(
    val id: String = "",
    @SerialName("name") val name: String? = null,
    @SerialName("title") val rawTitle: String? = null,
    val slug: String = "",
    val visible: Boolean = true,
    @SerialName("display_order") val displayOrder: Int = 0
) {
    val title: String get() = when {
        !name.isNullOrBlank() -> name
        !rawTitle.isNullOrBlank() -> rawTitle
        else -> slug
    }
}

/**
 * Mirrors the `section_games` join table.
 */
@Serializable
data class SectionGame(
    val id: String? = null,
    @SerialName("section_id") val sectionId: String,
    @SerialName("game_id") val gameId: String,
    @SerialName("display_order") val displayOrder: Int = 0
)

/**
 * Mirrors the `social_proofs` table.
 */
@Serializable
data class SocialProof(
    val id: String? = null,
    @SerialName("image_url") val imageUrl: String,
    val label: String? = null,
    val tag: String = "Order Delivered",
    val visible: Boolean = true,
    @SerialName("display_order") val displayOrder: Int = 0,
    @SerialName("created_at") val createdAt: String? = null
)

/** Dashboard statistics fetched from games and orders tables */
data class DashboardStats(
    val total: Int = 0,
    val visible: Int = 0,
    val hidden: Int = 0,
    val upcoming: Int = 0,
    val socialProofs: Int = 0,
    val pendingOrders: Int = 0,
    val totalOrders: Int = 0
)

/** Type of admin action shown in the Recent Activity feed */
enum class ActivityAction {
    ADDED,       // Game was added to the catalog
    EDITED,      // Game details were changed
    VISIBILITY_CHANGED, // visible flag toggled
    DELETED      // Game was removed
}

/**
 * A single item in the Recent Activity feed on the Dashboard.
 * Currently only [ActivityAction.ADDED] is populated from real data
 * (inferred via `created_at`). Other action types await an audit-log table.
 */
data class RecentActivity(
    val gameTitle: String,
    val actionType: ActivityAction = ActivityAction.ADDED,
    val timeAgo: String,           // pre-formatted relative string, e.g. "2h ago"
    val imageUrl: String,
    val statusLabel: String,       // "Visible" | "Hidden" | "Upcoming"
    val releaseStatus: String = "released",
    val isVisible: Boolean = true
)

/** Response model for Steam Store API */
@Serializable
data class SteamAppResponse(
    val success: Boolean,
    val data: SteamAppData? = null
)

@Serializable
data class SteamAppData(
    val name: String? = null,
    @SerialName("short_description") val shortDescription: String? = null,
    @SerialName("header_image") val headerImage: String? = null,
    val genres: List<SteamGenre> = emptyList()
)

@Serializable
data class SteamGenre(
    val id: String? = null,
    val description: String
)

/**
 * Single item inside an Order's JSONB items snapshot.
 */
@Serializable
data class OrderItem(
    val id: String? = null,
    val name: String = "",
    val price: Double = 0.0,
    val image: String? = null,
    @SerialName("originalPrice") val originalPrice: Double? = null
)

/**
 * Mirrors the `orders` table in Supabase.
 * Each order carries an `order_code` (e.g. GB-8492) that is printed on the WhatsApp bill
 * and verified by the admin.
 */
@Serializable
data class Order(
    val id: String? = null,
    @SerialName("user_id") val userId: String? = null,
    @SerialName("order_id") val orderId: String = "",
    @SerialName("order_code") val orderCode: String = "",
    @SerialName("customer_name") val customerName: String = "",
    @SerialName("customer_email") val customerEmail: String = "",
    val total: Double = 0.0,
    @SerialName("payment_method") val paymentMethod: String = "upi",
    @SerialName("utr_number") val utrNumber: String = "",
    val items: List<OrderItem> = emptyList(),
    val status: String = "pending",
    @SerialName("delivery_status") val deliveryStatus: String = "pending",
    @SerialName("delivery_notes") val deliveryNotes: String = "",
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null
)

/**
 * Dossier aggregating a customer's lifetime purchase history to empower re-selling and upselling.
 */
data class CustomerDossier(
    val totalOrders: Int = 0,
    val totalSpent: Double = 0.0,
    val isRecurring: Boolean = false,
    val pastOrders: List<Order> = emptyList()
)

/**
 * Result returned when verifying an order code from WhatsApp.
 */
data class OrderVerificationResult(
    val order: Order,
    val dossier: CustomerDossier
)
