package com.gamerbhidu.admin

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.fragment.app.FragmentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.core.view.WindowCompat
import androidx.navigation.compose.rememberNavController
import com.gamerbhidu.admin.ui.navigation.AppNavHost
import com.gamerbhidu.admin.ui.theme.GamerBhiduAdminTheme

/**
 * Epic Games Store Admin — Single Activity Architecture
 * Edge-to-edge with transparent system bars for immersive gaming aesthetic
 */
class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ── Immersive Edge-to-Edge Setup ─────────────────────────────────────
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        // Pure dark theme for system bars
        val epicStatusBarColor = Color(0xFF050505).toArgb()
        val epicNavBarColor = Color(0xFF050505).toArgb()
        
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(epicStatusBarColor),
            navigationBarStyle = SystemBarStyle.dark(epicNavBarColor)
        )

        // ── Maximum Refresh Rate for Smooth 120Hz Gaming UI ──────────────────
        requestHighRefreshRate()

        setContent {
            GamerBhiduAdminTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color.Transparent // Let gradient background show through
                ) {
                    val navController = rememberNavController()
                    AppNavHost(navController = navController)
                }
            }
        }
    }

    /**
     * Requests highest available refresh rate for buttery-smooth animations.
     * Epic Games UI demands 120Hz+ for that premium gaming feel.
     */
    private fun requestHighRefreshRate() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val display = display ?: return
            val highestMode = display.supportedModes
                .filter { it.refreshRate >= 60f } // Filter out low-power modes
                .maxByOrNull { it.refreshRate }
                ?: return
            
            window.attributes = window.attributes.also { params ->
                params.preferredDisplayModeId = highestMode.modeId
            }
        } else {
            @Suppress("DEPRECATION")
            window.attributes = window.attributes.also { params ->
                params.preferredRefreshRate = 120f
            }
        }

        // Keep screen on for admin monitoring
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        
        // Enable hardware acceleration for complex gradients/blurs
        window.setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        )
    }
}