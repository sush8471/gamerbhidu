package com.gamerbhidu.admin.ui.navigation

/**
 * All navigation routes in the app.
 * Using sealed class ensures type-safe navigation without magic strings.
 */
sealed class Screen(val route: String) {
    /** Admin login screen — shown when not authenticated */
    object Login : Screen("login")

    /** Main dashboard with stats overview */
    object Dashboard : Screen("dashboard")

    /** Full games catalog list with search and filters */
    object GamesList : Screen("games_list")

    /** Add new game or edit existing — gameId is null for new */
    object GameEditor : Screen("game_editor?gameId={gameId}") {
        fun createRoute(gameId: String? = null) =
            if (gameId != null) "game_editor?gameId=$gameId"
            else "game_editor"
    }

    /** Social proofs management */
    object SocialProofs : Screen("social_proofs")

    /** Orders & WhatsApp Bill Verification management */
    object Orders : Screen("orders")

    /** Homepage sections manager — add/remove/reorder games in each homepage section */
    object HomepageSections : Screen("homepage_sections")

    /** Combos manager — create and manage bundle deals */
    object Combos : Screen("combos")
}
