package com.gamerbhidu.admin.ui.theme

import androidx.compose.ui.graphics.Color

// ═════════════════════════════════════════════════════════════════════════════
// GAMER BHIDU — MODERN DARK THEME PALETTE (BLACK / WHITE / ZINC)
// 100% matched with website globals.css design system tokens:
// #050505 background, #111111 card surfaces, #FFFFFF crisp white accents
// ═════════════════════════════════════════════════════════════════════════════

// ─── Core Backgrounds (Pitch-Black & Obsidian Surfaces) ─────────────────────
val BackgroundDeep      = Color(0xFF050505)  // Website --color-background: #050505
val Background          = Color(0xFF050505)  // Website pitch black
val Surface             = Color(0xFF111111)  // Website --color-card: #111111
val SurfaceVariant      = Color(0xFF161616)  // Website --color-surface-elevated: #161616
val SurfaceGlass        = Color(0x18FFFFFF)  // Subtle translucent overlay

// ─── Borders & Dividers (Clean Hairlines) ──────────────────────────────────
val BorderSubtle        = Color(0x14FFFFFF)  // Faint hairline divider
val Border              = Color(0xFF262626)  // Website --color-border: #262626
val BorderLight         = Color(0x28FFFFFF)  // Elevated border
val BorderGlow          = Color(0x14FFFFFF)  // Neutral white ambient hint

// ─── Primary Accent (Modern Monochrome: Crisp White) ───────────────────────
val Primary             = Color(0xFFFFFFFF)  // Website --color-primary: #ffffff
val PrimaryBright       = Color(0xFFFFFFFF)  // Highlight / focus
val PrimarySoft         = Color(0xFFE4E4E7)  // Zinc-200
val PrimaryGlow         = Color(0x14FFFFFF)  // Soft white ambient glow
val PrimaryGradient     = Color(0xFFE4E4E7)  // Gradient end

// ─── Secondary & Accents (Zinc / Neutral Dark) ─────────────────────────────
val Secondary           = Color(0xFF27272A)  // Website --color-accent: #27272a (zinc-800)
val SecondaryBright     = Color(0xFF3F3F46)  // Zinc-700
val SecondaryGlow       = Color(0x14FFFFFF)
val CyanAccent          = Color(0xFFFFFFFF)  // Modern white accent
val CyanGlow            = Color(0x14FFFFFF)

// ─── Text Colors (High Contrast Typography) ─────────────────────────────────
val TextPrimary         = Color(0xFFFAFAFA)  // Website --color-foreground: #fafafa
val TextSecondary       = Color(0xFFA3A3A3)  // Website --color-muted-foreground: #a3a3a3
val TextTertiary        = Color(0xFF71717A)  // Zinc-500
val TextDisabled        = Color(0xFF52525B)  // Zinc-600
val TextOnPrimary       = Color(0xFF000000)  // Website --color-primary-foreground: #000000

// ─── Status Colors (Functional Accents) ─────────────────────────────────────
val Success             = Color(0xFF10B981)  // Website emerald green: #10b981
val SuccessGlow         = Color(0x2010B981)
val SuccessSubtle       = Color(0x1810B981)
val Warning             = Color(0xFFF59E0B)  // Website amber: #f59e0b
val WarningGlow         = Color(0x20F59E0B)
val WarningSubtle       = Color(0x18F59E0B)
val Error               = Color(0xFFEF4444)  // Website crimson: #ef4444
val ErrorGlow           = Color(0x20EF4444)
val ErrorSubtle         = Color(0x18EF4444)
val Info                = Color(0xFFFFFFFF)  // Neutral white
val InfoSubtle          = Color(0x14FFFFFF)

// ─── Game Status Colors ─────────────────────────────────────────────────────
val StatusReleased      = Color(0xFF10B981)  // Emerald = live (matches website)
val StatusUpcoming      = Color(0xFFF59E0B)  // Amber = coming soon (matches website)
val StatusBeta          = Color(0xFF71717A)  // Zinc neutral = beta
val StatusHidden        = Color(0xFFF59E0B)  // Amber = hidden
val StatusVisible       = Color(0xFF10B981)  // Emerald = visible

// ─── Card & Component Colors ────────────────────────────────────────────────
val CardBackground      = Color(0xFF111111)  // Website --color-card: #111111
val CardBackgroundHover = Color(0xFF161616)  // Website --color-surface-elevated: #161616
val CardBorder          = Color(0xFF262626)  // Website --color-border: #262626
val CardBorderGlow      = Color(0x14FFFFFF)
val InputBackground     = Color(0xFF0D0D0D)  // Deep obsidian input
val InputBorder         = Color(0xFF262626)  // Neutral border
val InputBorderFocus    = Color(0xFF525252)  // Neutral ring
val ButtonSecondary     = Color(0xFF1E1E1E)  // Website --color-secondary: #1e1e1e
val ButtonSecondaryHover= Color(0xFF262626)

// ─── Special Effects ────────────────────────────────────────────────────────
val GlowBlue            = Color(0x14FFFFFF)  // Neutral white luminescence
val GlowPurple          = Color(0x14FFFFFF)
val GlowCyan            = Color(0x14FFFFFF)
val ShadowColor         = Color(0x80000000)
val OverlayScrim        = Color(0xB0000000)  // Modal scrim
val OverlayGradient     = Color(0xCC050505)

// ─── Gradients (Modern Monochrome & Neutral Depth) ──────────────────────────
val GradientPrimary     = listOf(Color(0xFFFFFFFF), Color(0xFFE4E4E7))
val GradientSecondary   = listOf(Color(0xFF27272A), Color(0xFF18181B))
val GradientAccent      = listOf(Color(0xFFFFFFFF), Color(0xFFD4D4D8))
val GradientBackground  = listOf(Color(0xFF050505), Color(0xFF0A0A0A), Color(0xFF111111))
val GradientCard        = listOf(Color(0x14FFFFFF), Color(0x08FFFFFF))
val GradientGlow        = listOf(Color(0x14FFFFFF), Color(0x00FFFFFF))

// Legacy aliases for backward compatibility
val PrimaryVariant      = PrimarySoft
val Visible             = StatusVisible
val Hidden              = StatusHidden
val Released            = StatusReleased
val Upcoming            = StatusUpcoming