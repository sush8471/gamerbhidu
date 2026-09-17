package com.gamerbhidu.admin.ui.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.gamerbhidu.admin.data.repository.AdminRepository
import com.gamerbhidu.admin.ui.screens.combos.CombosScreen
import com.gamerbhidu.admin.ui.screens.dashboard.DashboardScreen
import com.gamerbhidu.admin.ui.screens.editor.GameEditorScreen
import com.gamerbhidu.admin.ui.screens.games.GamesListScreen
import com.gamerbhidu.admin.ui.screens.login.LoginScreen
import com.gamerbhidu.admin.ui.screens.orders.OrdersScreen
import com.gamerbhidu.admin.ui.screens.proofs.SocialProofsScreen
import com.gamerbhidu.admin.ui.screens.sections.HomepageSectionsScreen
import com.gamerbhidu.admin.ui.theme.*
import kotlinx.coroutines.launch

// ═════════════════════════════════════════════════════════════════════════════
// EPIC GAMES STORE NAVIGATION
// ═════════════════════════════════════════════════════════════════════════════

data class DrawerSection(
    val label: String,
    val icon: ImageVector,
    val route: String? = null,
    val badge: String? = null,
    val isDividerAbove: Boolean = false,
    val glowColor: Color? = null
)

private val drawerItems = listOf(
    // ── Main Navigation ─────────────────────────────────────────────────────
    DrawerSection(
        "Dashboard", 
        Icons.Outlined.Home, 
        Screen.Dashboard.route,
        glowColor = Color(0xFFE4E4E7)
    ),
    DrawerSection(
        "Games Catalog", 
        Icons.Outlined.Gamepad, 
        Screen.GamesList.route,
        glowColor = Color.White
    ),
    
    // ── Management ────────────────────────────────────────────────────────────
    DrawerSection(
        "Orders", 
        Icons.Outlined.ShoppingCart, 
        route = Screen.Orders.route,
        badge = "New", 
        isDividerAbove = true,
        glowColor = Color(0xFFA1A1AA)
    ),
    DrawerSection(
        "Social Proofs", 
        Icons.Outlined.Verified, 
        Screen.SocialProofs.route,
        glowColor = Success
    ),
    DrawerSection(
        "Homepage Sections",
        Icons.Outlined.Home,
        Screen.HomepageSections.route,
        glowColor = Color(0xFFE4E4E7)
    ),
    DrawerSection(
        "Combos",
        Icons.Outlined.Layers,
        Screen.Combos.route,
        glowColor = Color(0xFFF43F5E)
    ),
    DrawerSection("Settings", Icons.Outlined.Settings),
    
    // ── Account ───────────────────────────────────────────────────────────────
    DrawerSection(
        "Sign Out", 
        Icons.AutoMirrored.Outlined.Logout, 
        isDividerAbove = true,
        glowColor = Error
    ),
)


@OptIn(ExperimentalAnimationApi::class)
@Composable
fun AppNavHost(navController: NavHostController) {
    val startDestination = if (AdminRepository.isLoggedIn()) {
        Screen.Dashboard.route
    } else {
        Screen.Login.route
    }

    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current
    var drawerOpen by remember { mutableStateOf(false) }

    val currentBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = currentBackStack?.destination?.route

    val bottomBarScreens = remember {
        setOf(
            Screen.Dashboard.route,
            Screen.GamesList.route,
            Screen.Orders.route,
            Screen.SocialProofs.route,
            Screen.HomepageSections.route,
            Screen.Combos.route
        )
    }
    val showBottomBar = currentRoute in bottomBarScreens

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        GamerBhiduAdminTheme.colors.backgroundDeep,
                        GamerBhiduAdminTheme.colors.background
                    )
                )
            )
    ) {
        // ── Main Scaffold ────────────────────────────────────────────────────
        Scaffold(
            bottomBar = {
                if (showBottomBar) {
                    AdminBottomBar(
                        currentRoute = currentRoute,
                        onNavigate = { targetRoute ->
                            if (currentRoute != targetRoute) {
                                navController.navigate(targetRoute) {
                                    popUpTo(Screen.Dashboard.route) { inclusive = false }
                                    launchSingleTop = true
                                }
                            }
                        },
                        onOpenDrawer = { drawerOpen = true }
                    )
                }
            },
            snackbarHost = {
                SnackbarHost(snackbarHostState) { data ->
                    Snackbar(
                        snackbarData = data,
                        containerColor = GamerBhiduAdminTheme.colors.surface,
                        contentColor = GamerBhiduAdminTheme.colors.textPrimary,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .border(
                                width = 1.dp,
                                color = GamerBhiduAdminTheme.colors.borderLight,
                                shape = RoundedCornerShape(16.dp)
                            )
                    )
                }
            },
            containerColor = Color.Transparent,
            contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { paddingValues ->
            NavHost(
                navController = navController,
                startDestination = startDestination,
                modifier = Modifier.padding(paddingValues),
                enterTransition = {
                    fadeIn(animationSpec = tween(300)) +
                    slideInHorizontally(
                        initialOffsetX = { it / 3 },
                        animationSpec = tween(300, easing = FastOutSlowInEasing)
                    )
                },
                exitTransition = {
                    fadeOut(animationSpec = tween(250))
                },
                popEnterTransition = {
                    fadeIn(animationSpec = tween(300))
                },
                popExitTransition = {
                    fadeOut(animationSpec = tween(250)) +
                    slideOutHorizontally(
                        targetOffsetX = { it / 3 },
                        animationSpec = tween(300, easing = FastOutSlowInEasing)
                    )
                }
            ) {
                composable(Screen.Login.route) {
                    LoginScreen(
                        onLoginSuccess = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.Login.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.Dashboard.route) {
                    DashboardScreen(
                        onOpenMenu = { drawerOpen = true },
                        onNavigateToGames = { navController.navigate(Screen.GamesList.route) },
                        onNavigateToAddGame = { navController.navigate(Screen.GameEditor.createRoute()) },
                        onNavigateToOrders = { navController.navigate(Screen.Orders.route) },
                        onNavigateToProofs = { navController.navigate(Screen.SocialProofs.route) },
                        onNavigateToSections = { navController.navigate(Screen.HomepageSections.route) },
                        onNavigateToCombos = { navController.navigate(Screen.Combos.route) },
                        onLogout = {
                            navController.navigate(Screen.Login.route) {
                                popUpTo(Screen.Dashboard.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.GamesList.route) {
                    GamesListScreen(
                        onNavigateBack = { navController.popBackStack() },
                        onAddGame = { navController.navigate(Screen.GameEditor.createRoute()) },
                        onEditGame = { gameId ->
                            navController.navigate(Screen.GameEditor.createRoute(gameId))
                        }
                    )
                }

                composable(
                    route = Screen.GameEditor.route,
                    arguments = listOf(
                        navArgument("gameId") {
                            type = NavType.StringType
                            nullable = true
                            defaultValue = null
                        }
                    )
                ) { entry ->
                    GameEditorScreen(
                        gameId = entry.arguments?.getString("gameId"),
                        onNavigateBack = { navController.popBackStack() },
                        onSaved = { navController.popBackStack() }
                    )
                }

                composable(Screen.SocialProofs.route) {
                    SocialProofsScreen(onNavigateBack = { navController.popBackStack() })
                }

                composable(Screen.Orders.route) {
                    OrdersScreen(onNavigateBack = { navController.popBackStack() })
                }

                composable(Screen.HomepageSections.route) {
                    HomepageSectionsScreen(onNavigateBack = { navController.popBackStack() })
                }

                composable(Screen.Combos.route) {
                    CombosScreen(onNavigateBack = { navController.popBackStack() })
                }
            }
        }

        // ── Back Handler ─────────────────────────────────────────────────────
        BackHandler(enabled = drawerOpen) {
            drawerOpen = false
        }

        // ── Epic Scrim with Gradient ─────────────────────────────────────────
        AnimatedVisibility(
            visible = drawerOpen,
            enter = fadeIn(tween(durationMillis = 350, easing = FastOutSlowInEasing)),
            exit = fadeOut(tween(durationMillis = 300, easing = FastOutSlowInEasing)),
            modifier = Modifier.zIndex(10f)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.6f),
                                Color.Black.copy(alpha = 0.7f)
                            )
                        )
                    )
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { drawerOpen = false }
            )
        }

        // ── Epic Glass Drawer ────────────────────────────────────────────────
        AnimatedVisibility(
            visible = drawerOpen,
            enter = slideInHorizontally(
                animationSpec = tween(
                    durationMillis = 350,
                    easing = CubicBezierEasing(0.16f, 1f, 0.3f, 1f)
                ),
                initialOffsetX = { -it }
            ),
            exit = slideOutHorizontally(
                animationSpec = tween(
                    durationMillis = 280,
                    easing = FastOutSlowInEasing
                ),
                targetOffsetX = { -it }
            ),
            modifier = Modifier.zIndex(11f)
        ) {
            EpicSideDrawer(
                currentRoute = currentRoute,
                onSectionClick = { section ->
                    when {
                        section.route != null -> {
                            drawerOpen = false
                            if (currentRoute != section.route) {
                                navController.navigate(section.route) {
                                    popUpTo(Screen.Dashboard.route) { inclusive = false }
                                    launchSingleTop = true
                                }
                            }
                        }
                        section.label == "Sign Out" -> {
                            drawerOpen = false
                            coroutineScope.launch {
                                com.gamerbhidu.admin.util.BiometricHelper.clearCredentials(context)
                                AdminRepository.signOut()
                                navController.navigate(Screen.Login.route) {
                                    popUpTo(Screen.Dashboard.route) { inclusive = true }
                                }
                            }
                        }
                        else -> {
                            drawerOpen = false
                            coroutineScope.launch {
                                snackbarHostState.showSnackbar("${section.label} — Coming soon!")
                            }
                        }
                    }
                },
                onClose = { drawerOpen = false }
            )
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODERN MATERIAL 3 NAVIGATION DRAWER
// ═════════════════════════════════════════════════════════════════════════════

@Composable
fun EpicSideDrawer(
    currentRoute: String?,
    onSectionClick: (DrawerSection) -> Unit,
    onClose: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClose
            ),
        contentAlignment = Alignment.CenterStart
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(0.80f)
                .shadow(
                    elevation = 16.dp,
                    shape = RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp),
                    ambientColor = Color.Black.copy(alpha = 0.5f),
                    spotColor = Color.Black.copy(alpha = 0.5f)
                )
                .background(
                    color = GamerBhiduAdminTheme.colors.surface,
                    shape = RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp)
                )
                .border(
                    width = 1.dp,
                    color = GamerBhiduAdminTheme.colors.borderSubtle,
                    shape = RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp)
                )
                .clip(RoundedCornerShape(topEnd = 16.dp, bottomEnd = 16.dp))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = {}
                )
        ) {
            // ── Clean Brand Header ───────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(start = 24.dp, end = 24.dp, top = 24.dp, bottom = 18.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        "GamerBhidu",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = GamerBhiduAdminTheme.colors.textPrimary,
                            letterSpacing = (-0.5).sp
                        )
                    )
                    Box(
                        modifier = Modifier
                            .background(
                                color = GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(6.dp)
                            )
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            "ADMIN",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = GamerBhiduAdminTheme.colors.primaryBright,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                letterSpacing = 1.sp
                            )
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(
                                GamerBhiduAdminTheme.colors.success,
                                CircleShape
                            )
                    )
                    Text(
                        "Steam Store Management",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.textSecondary
                        )
                    )
                }
            }

            HorizontalDivider(
                color = GamerBhiduAdminTheme.colors.borderSubtle,
                thickness = 1.dp
            )

            Spacer(Modifier.height(12.dp))

            // ── Navigation Items ─────────────────────────────────────────────
            drawerItems.forEachIndexed { index, section ->
                val isLast = index == drawerItems.lastIndex
                val isActive = section.route != null && currentRoute == section.route
                val isLogout = section.label == "Sign Out"

                if (section.isDividerAbove) {
                    Spacer(Modifier.height(6.dp))
                    HorizontalDivider(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp),
                        color = GamerBhiduAdminTheme.colors.borderSubtle,
                        thickness = 1.dp
                    )
                    Spacer(Modifier.height(6.dp))
                }

                if (isLast) Spacer(Modifier.weight(1f))

                // Clean Material 3 Navigation Item
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 2.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            color = when {
                                isActive -> GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.12f)
                                isLogout -> GamerBhiduAdminTheme.colors.error.copy(alpha = 0.08f)
                                else -> Color.Transparent
                            }
                        )
                        .clickable { onSectionClick(section) }
                        .padding(horizontal = 14.dp, vertical = 12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Clean unboxed icon
                        Icon(
                            section.icon,
                            contentDescription = section.label,
                            tint = when {
                                isActive -> GamerBhiduAdminTheme.colors.primary
                                isLogout -> GamerBhiduAdminTheme.colors.error
                                else -> GamerBhiduAdminTheme.colors.textSecondary
                            },
                            modifier = Modifier.size(22.dp)
                        )

                        // Label
                        Text(
                            section.label,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = if (isActive) FontWeight.SemiBold else FontWeight.Medium,
                                color = when {
                                    isActive -> GamerBhiduAdminTheme.colors.primary
                                    isLogout -> GamerBhiduAdminTheme.colors.error
                                    else -> GamerBhiduAdminTheme.colors.textPrimary
                                }
                            ),
                            modifier = Modifier.weight(1f)
                        )

                        // Clean badge
                        section.badge?.let { badge ->
                            Box(
                                modifier = Modifier
                                    .background(
                                        color = GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    badge,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = GamerBhiduAdminTheme.colors.primaryBright,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Clean Footer ─────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 14.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Text(
                    "GamerBhidu Admin v1.0.0",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = GamerBhiduAdminTheme.colors.textTertiary,
                        fontSize = 11.sp
                    )
                )
            }
        }
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODERN OBSIDIAN BOTTOM NAVIGATION BAR
// ═════════════════════════════════════════════════════════════════════════════

@Composable
private fun AdminBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    onOpenDrawer: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = Color(0xFF0D0D0D),
        border = BorderStroke(1.dp, Color(0xFF1F1F1F))
    ) {
        NavigationBar(
            containerColor = Color(0xFF0D0D0D),
            contentColor = Color.White,
            tonalElevation = 0.dp,
            modifier = Modifier.height(62.dp)
        ) {
            val items = listOf(
                Triple("Dashboard", Screen.Dashboard.route, Icons.Outlined.Home to Icons.Filled.Home),
                Triple("Catalog", Screen.GamesList.route, Icons.Outlined.SportsEsports to Icons.Filled.SportsEsports),
                Triple("Orders", Screen.Orders.route, Icons.Outlined.ShoppingCart to Icons.Filled.ShoppingCart),
                Triple("Proofs", Screen.SocialProofs.route, Icons.Outlined.Verified to Icons.Filled.Verified),
            )

            items.forEach { (label, route, icons) ->
                val selected = currentRoute == route
                NavigationBarItem(
                    selected = selected,
                    onClick = { onNavigate(route) },
                    icon = {
                        Icon(
                            imageVector = if (selected) icons.second else icons.first,
                            contentDescription = label,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    label = {
                        Text(
                            text = label,
                            fontSize = 10.sp,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color.White,
                        selectedTextColor = Color.White,
                        unselectedIconColor = Color(0xFF71717A),
                        unselectedTextColor = Color(0xFF71717A),
                        indicatorColor = Color.White.copy(alpha = 0.12f)
                    )
                )
            }

            // "More" tab to open side drawer
            NavigationBarItem(
                selected = false,
                onClick = onOpenDrawer,
                icon = {
                    Icon(
                        imageVector = Icons.Outlined.Menu,
                        contentDescription = "More",
                        modifier = Modifier.size(20.dp)
                    )
                },
                label = {
                    Text(
                        text = "More",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Color.White,
                    selectedTextColor = Color.White,
                    unselectedIconColor = Color(0xFF71717A),
                    unselectedTextColor = Color(0xFF71717A),
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}