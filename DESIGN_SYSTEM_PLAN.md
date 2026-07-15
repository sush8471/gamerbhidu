# Gamer Bhidu Design System Implementation Plan

## 1. Executive Summary

This document outlines a phased roadmap to fully align the Gamer Bhidu storefront with the **Activision + Ubisoft Store** premium cinematic dark-theme design system. The foundation (color tokens, font imports, Tailwind v4 theme config) is already in place in `globals.css`. The primary work involves **replacing hardcoded legacy colors**, **adding cinematic background treatments**, **refining typography hierarchy**, and **component-level polish** to match the reference screenshots.

---

## 2. Current State Analysis

### 2.1 What Is Already Aligned
| Area | Status | Notes |
|------|--------|-------|
| **Tailwind v4 Theme** | 80% | `globals.css` already defines `--color-background: #0c0a09`, `--color-primary: #d9a75d`, `--color-card: #1c1917`, `--color-border: #2e2a28`, `--font-display: Rajdhani`, `--font-body: Outfit`. |
| **Font Imports** | 100% | Google Fonts for Rajdhani, Outfit, and Recursive Mono are imported. |
| **Base Typography** | 70% | `h1-h6` and `p` base styles are set in `globals.css` with Rajdhani for headings and Outfit for body. |
| **Shadcn UI Base** | 100% | Components are installed and use CSS variables that map to the theme tokens. |

### 2.2 Critical Gaps & Technical Debt
| Issue | Impact | Location |
|-------|--------|----------|
| **Hardcoded Legacy Colors** | The codebase contains hundreds of hardcoded hex values (`#3B82F6`, `#00D2FF`, `#A4D007`, `#B0B8D0`, `#8F98A0`, `#121622`, `#202838`, etc.). While `globals.css` has CSS override hacks using `[class*=...]` selectors, this is fragile and hard to maintain. It also prevents using Tailwind's `opacity` modifiers (e.g., `bg-primary/50`). | `src/app/games/page.tsx`, `src/app/games/[id]/page.tsx`, `src/components/sections/*.tsx` |
| **Missing Cinematic Gradients** | No Activision-style radial spotlights or deep black-to-charcoal gradients behind heroes/cards. Backgrounds are mostly flat `#080A10`. | `page.tsx`, `hero-3.tsx`, `games/[id]/page.tsx` |
| **Inconsistent Section Headers** | Some are uppercase/black (good), others are sentence-case. Need consistent uppercase, tracking-wide, Rajdhani headers à la Ubisoft Store. | All section components |
| **Footer Mismatch** | Current footer is a 3-column minimal layout. The reference (Image 1) shows a 4-column Activision-style mega-footer with social circles, game links, company links, legal links, ESRB badge, language selector, and copyright centering. | `footer-section.tsx` |
| **Game Detail Page Color Drift** | The `[id]/page.tsx` uses a Steam-cyan aesthetic (`#00D2FF`) for tags, prices, and buttons. This must transition to the warm gold (`#d9a75d`) primary palette while preserving good contrast. | `games/[id]/page.tsx` |
| **Missing Hover Glows** | Specification requests `scale-105`, gold border shifts, and `rgba(217, 167, 93, 0.25)` glow shadows. Only a few cards have basic hover effects. | Card components |
| **No Spotlight Depth** | Cards and media players should have a subtle radial gradient behind them to create "spotlight focus" depth. | Global layout backgrounds |

---

## 3. Design Token Refinement

### 3.1 Proposed Token Additions to `@theme` in `globals.css`

```css
@theme {
  /* Existing tokens preserved... */

  /* Activision-Style Gradients */
  --color-spotlight: #121622;
  --color-spotlight-warm: #1c1917;
  --gradient-hero: radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-spotlight) 0%, #000000 60%);
  --gradient-card-spotlight: radial-gradient(ellipse 60% 50% at 50% 40%, rgba(28, 25, 23, 0.6) 0%, transparent 70%);

  /* Glow & Shadow Colors */
  --shadow-glow-sm: 0 0 12px rgba(217, 167, 93, 0.15);
  --shadow-glow-md: 0 0 24px rgba(217, 167, 93, 0.25);
  --shadow-glow-lg: 0 8px 32px rgba(217, 167, 93, 0.25);

  /* Text Hierarchy Refinements */
  --color-text-heading: #f5f5f4;
  --color-text-body: #a8a29e;
  --color-text-caption: #78716c;

  /* Derived Surfaces */
  --color-surface-elevated: #161412;
  --color-surface-overlay: rgba(0, 0, 0, 0.65);
}
```

### 3.2 Deprecation Plan for Hardcoded Colors
Instead of the brittle `[class*=...]` CSS overrides, perform a **find-and-replace sweep** across `.tsx` files using a codemod/script or manual edit:

| Legacy Hex | Modern Token | Usage |
|------------|--------------|-------|
| `#3B82F6` | `var(--color-primary)` or `bg-primary` | Buttons, badges, borders, glows |
| `#00D2FF` | `var(--color-primary)` | Game detail tags, prices, icons |
| `#A4D007` | `var(--color-accent)` | Success states, recommended badges |
| `#2563EB` | `var(--color-accent)` | Button hover states |
| `#B0B8D0` | `var(--color-muted-foreground)` | Descriptions, secondary text |
| `#8F98A0` | `var(--color-muted-foreground)` | Meta text, captions |
| `#6B7BA4` | `var(--color-muted-foreground)` | Labels, placeholder text |
| `#121622` | `var(--color-card)` or `bg-card` | Card backgrounds |
| `#202838` | `var(--color-border)` or `border-border` | Card borders, dividers |
| `#080A10` | `var(--color-background)` or `bg-background` | Page backgrounds |
| `#0d1120` | `var(--color-card)` | Secondary surfaces |
| `#17202d` | `var(--color-background-secondary)` | Darker tags |
| `#1e2640` | `var(--color-border)` | Form borders |
| `#25D366` | Keep as `#25D366` | WhatsApp brand color is intentional |

---

## 4. Component-Level Implementation Roadmap

### Phase 1: Token Consolidation & Global Polish (Priority: Critical)
**Goal**: Remove CSS override hacks and make every component consume the Tailwind v4 theme tokens.

1. **`src/app/globals.css`**
   - Remove **all** `[class*="bg-[#3B82F6]"]`... override blocks (lines ~279-458). They are brittle and will break as soon as arbitrary values change.
   - Add the new `--gradient-hero`, `--shadow-glow-*`, and `--color-surface-*` tokens.
   - Add a `.spotlight-bg` utility class for radial-gradient backgrounds.

2. **`src/app/layout.tsx`**
   - Add `className="bg-background text-foreground antialiased"` to `<body>` to ensure the base theme is applied even before client hydration.

3. **`src/app/page.tsx` & `src/app/games/page.tsx`**
   - Replace `bg-[#080A10]` with `bg-background`.
   - Apply the cinematic hero gradient wrapper.

---

### Phase 2: Typography & Header System (Priority: High)
**Goal**: Achieve the clean, uppercase, wide-tracking Ubisoft Store section-header aesthetic.

1. **Create `src/components/ui/section-header.tsx`**
   A reusable component enforcing:
   - Font: `font-display` (Rajdhani)
   - Transform: `uppercase`
   - Tracking: `tracking-[0.12em]` or `tracking-widest`
   - Weight: `font-bold` (700) or `font-black` (900)
   - Color: `text-foreground`
   - Optional subtitle: `text-muted-foreground`, `font-body`, normal case.

2. **Refactor all section components** to use `<SectionHeader>`:
   - `how-it-works.tsx`
   - `game-cards-grid-discover.tsx`
   - `combo-deals.tsx`
   - `recently-launched.tsx`
   - `upcoming-games.tsx`
   - `social-proof.tsx`
   - `games/[id]/page.tsx` (FAQ, System Requirements, You May Also Like)

---

### Phase 3: Hero & Cinematic Backgrounds (Priority: High)
**Goal**: Introduce the Activision "spotlight focus" depth effect.

1. **`src/components/ui/hero-3.tsx` (AnimatedMarqueeHero)**
   - Wrap the hero in a full-width container with `bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,_#121622_0%,_#000000_70%)]`.
   - Keep the marquee at the bottom but dim it slightly (`opacity-80`) so the spotlight remains on the headline.
   - Ensure the `ActionButton` uses `bg-primary text-primary-foreground` instead of hardcoded values.

2. **`src/app/games/[id]/page.tsx` (Game Detail)**
   - Replace the fixed background image + blur with a more cinematic treatment:
     - Base: `bg-background`
     - Behind the main media player/gallery: a local radial gradient `from-[#1c1917]/60 to-transparent` creating a soft pool of light.
   - Remove the cyan `#00D2FF` glow effects. Replace with `shadow-glow-md` using the gold primary.

---

### Phase 4: Card & Hover Polish (Priority: High)
**Goal**: Unify all card surfaces and implement the gold-accent hover language.

1. **Standardize Card Shell**
   Create a minimal wrapper convention (or a tiny `GameCardShell` component) so every card uses:
   - `bg-card`
   - `border border-border`
   - `rounded-xl` (12px / `radius` token)
   - Hover: `hover:border-primary/60 hover:shadow-glow-md hover:scale-[1.02]`
   - Transition: `transition-all duration-300 ease-out`

2. **Affected Components**
   - `game-cards-grid-discover.tsx`
   - `recently-launched.tsx`
   - `upcoming-games.tsx`
   - `games/page.tsx` (`GameCard`)
   - `games/[id]/page.tsx` (Similar Games)

3. **Badge Standardization**
   - Discount badges: `bg-primary text-primary-foreground` (warm gold on dark charcoal)
   - "NEW" / "Coming Soon" badges: keep accent colors but align to tokens.
   - Remove the red `bg-red-600` discount badge in `recently-launched.tsx`; use `bg-primary`.

---

### Phase 5: Game Detail Page Refactor (Priority: High)
**Goal**: Fully transition the detail page from Steam-cyan to the warm gold/charcoal Gamer Bhidu identity.

1. **Color Migration Checklist for `[id]/page.tsx`**
   | Element | Current | Target |
   |---------|---------|--------|
   | Base Game tag | `bg-[#00D2FF]/10 border-[#00D2FF]/20 text-[#00D2FF]` | `bg-primary/10 border-primary/20 text-primary` |
   | Review thumbs badge | `text-[#00D2FF] fill-[#00D2FF]` | `text-primary fill-primary` |
   | Genre/Tags | `text-[#00D2FF]` | `text-primary` |
   | Developer/Publisher | `text-[#00D2FF]` | `text-primary` |
   | Section icons (Monitor, HelpCircle, Gamepad2) | `text-[#00D2FF]` | `text-primary` |
   | Buy Now button | Green gradient | `bg-primary hover:bg-accent text-primary-foreground` or keep WhatsApp green if it's a direct-action CTA |
   | Add to Cart icon | `text-[#00D2FF]` | `text-primary` |
   | In Cart check | `text-[#A4D007]` | `text-accent` |
   | Price | `text-[#00D2FF]` | `text-primary` |
   | Discount pill | `bg-[#4c6b22] text-[#a4d007]` | `bg-primary/20 text-primary` |
   | FAQ chevron | `text-[#00D2FF]` | `text-primary` |
   | Similar games ring | `group-hover:ring-[#00D2FF]` | `group-hover:ring-primary` |
   | Similar games shadow | `rgba(0,210,255,0.3)` | `rgba(217,167,93,0.25)` |

2. **Cinematic Background on Detail Page**
   - Add a subtle radial gradient behind the header image / video area:
     ```html
     <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(28,25,23,0.5)_0%,transparent_70%)] -z-10" />
     ```

---

### Phase 6: Footer Redesign (Priority: Medium)
**Goal**: Match the Activision reference screenshot (Image 1).

1. **`src/components/sections/footer-section.tsx`**
   - Restructure to a **4-column desktop layout**:
     - **Follow Us**: Social icons as circle buttons (border `border-border`, hover `border-primary` + `text-primary`).
     - **Popular Games**: Links to top game pages or categories (e.g., Call of Duty, GTA, Assassin's Creed).
     - **Company**: About, Contact, FAQ.
     - **Legal**: Terms, Privacy, Refund Policy.
   - Add a **Back-to-Top** button on the far right (matching Image 1).
   - **Bottom bar**:
     - Centered Logo (Gamer Bhidu logo, white monochrome version if available).
     - Copyright text: `© 2026 Gamer Bhidu. All rights reserved.`
     - Optional: Payment method icons / trust badges (UPI, WhatsApp, Steam).
   - Replace all hardcoded `#B0B8D0`, `#202838`, `#121622` with theme tokens.
   - Border top: `border-t border-border`.

---

### Phase 7: Navbar Refinement (Priority: Medium)
**Goal**: Cleaner, more premium Ubisoft Store-style navbar.

1. **`src/components/sections/gamerbhidu-navbar.tsx`**
   - Keep the sticky glassmorphism (`backdrop-blur-md`).
   - Ensure text colors use `text-muted-foreground` for inactive links and `text-foreground` for active/hover.
   - Search bar (`navbar-search.tsx`): ensure it uses `rounded-full` pill shape, `bg-card/50`, `border-border`, and `focus:border-primary`.
   - Remove the green WhatsApp button from the navbar on desktop; move it to a floating action button (FAB) or keep it only in the mobile drawer to reduce visual clutter in the header.

---

### Phase 8: New UI Patterns (Priority: Medium)
**Goal**: Add the premium micro-interactions described in the spec.

1. **Glare/Foil Cards**
   - Already implemented in `glare-card.tsx` and used in `social-proof.tsx`. Ensure the border color on glare cards uses `border-border` and the glare color is warm white/gold tinted instead of pure white.

2. **Score Badges (Ubisoft Hero Style)**
   - If adding a "Plan" or "Membership" page later, implement the review-score badge pattern:
     ```
     [5/5 DEXERTO] [90/100 GAMERANT] [9/10 IGN]
     ```
     Small pill badges with `bg-card border-border text-foreground font-mono`.

3. **FAQ Accordion Polish**
   - Ensure the FAQ in `faq.tsx` and `games/[id]/page.tsx` uses thin `border-b border-border` separators.
   - Section title: uppercase, tracking-wide, Rajdhani.
   - Chevron rotation animation already present; just update colors to `text-primary`.

4. **WhatsApp FAB (Floating Action Button)**
   - If removed from desktop navbar, add a fixed FAB in the bottom-right on mobile:
     ```html
     <button className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center">
       <FaWhatsapp className="w-7 h-7" />
     </button>
     ```

---

## 5. File-by-File Action Checklist

| File | Action | Phase |
|------|--------|-------|
| `src/app/globals.css` | Remove CSS override hacks; add gradient/shadow tokens; refine base styles | 1 |
| `src/app/layout.tsx` | Add theme className to body | 1 |
| `src/app/page.tsx` | Replace hardcoded bg; wrap hero in gradient | 1, 3 |
| `src/app/games/page.tsx` | Replace all hardcoded hexes with tokens; standardize cards | 4 |
| `src/app/games/[id]/page.tsx` | Mass color migration; add cinematic bg; standardize badges | 5 |
| `src/components/ui/hero-3.tsx` | Use theme tokens; add radial gradient bg | 3 |
| `src/components/sections/gamerbhidu-navbar.tsx` | Tokenize colors; refine search pill | 7 |
| `src/components/sections/footer-section.tsx` | Full redesign to 4-col Activision layout | 6 |
| `src/components/sections/how-it-works.tsx` | Use `SectionHeader`; tokenize colors | 2, 1 |
| `src/components/sections/game-cards-grid-discover.tsx` | Standardize card shell; tokenize | 4 |
| `src/components/sections/combo-deals.tsx` | Standardize card shell; tokenize | 4 |
| `src/components/sections/recently-launched.tsx` | Standardize card shell; fix red badge | 4 |
| `src/components/sections/upcoming-games.tsx` | Standardize card shell; tokenize | 4 |
| `src/components/sections/social-proof.tsx` | Tokenize; ensure gradient uses theme | 1, 4 |
| `src/components/ui/glare-card.tsx` | Tint glare color to warm gold | 8 |
| `src/components/ui/section-header.tsx` | **Create new** reusable component | 2 |

---

## 6. Recommended Execution Order (Sprints)

### Sprint A: Foundation (Tokens & Globals)
- [ ] Clean `globals.css` of override hacks
- [ ] Add new gradient/shadow/surface tokens
- [ ] Audit and list every legacy hex still in use

### Sprint B: Typography & Headers
- [ ] Build `SectionHeader` component
- [ ] Refactor all 8 section components to use it
- [ ] Update `layout.tsx` body className

### Sprint C: Browse & Cards
- [ ] Refactor `games/page.tsx` (`GameCard`, filters, pagination)
- [ ] Refactor `game-cards-grid-discover.tsx`
- [ ] Refactor `recently-launched.tsx`
- [ ] Refactor `upcoming-games.tsx`
- [ ] Refactor `combo-deals.tsx`

### Sprint D: Game Detail Page
- [ ] Systematic color replacement in `games/[id]/page.tsx`
- [ ] Cinematic background behind media
- [ ] Badge & button standardization

### Sprint E: Shell Components
- [ ] Navbar polish
- [ ] Footer redesign to Activision 4-column layout
- [ ] Glare card tint adjustment

### Sprint F: Polish & QA
- [ ] Cross-browser hover glow testing
- [ ] Mobile responsive verification
- [ ] Lighthouse performance check (ensure gradients are GPU-friendly)

---

## 7. Success Criteria

1. **Zero hardcoded blue/cyan/green hexes** (except WhatsApp brand `#25D366`) in the main storefront components.
2. **All backgrounds, borders, and text** resolve through the Tailwind v4 theme tokens (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.).
3. **Hero section** displays a subtle radial spotlight gradient behind the headline.
4. **Section titles** are consistently uppercase, Rajdhani, wide-tracking.
5. **Card hover state** triggers a warm gold border + soft gold glow (`shadow-glow-md`).
6. **Footer** matches the 4-column + social circles + centered copyright structure from the Activision reference.
7. **Game detail page** no longer resembles a Steam page; it uses the warm gold/charcoal Gamer Bhidu identity throughout.

---

## 8. Appendix: Quick Reference — Theme Token Map

| Semantic Role | Tailwind Class | Hex Value |
|---------------|----------------|-----------|
| Page Background | `bg-background` | `#0c0a09` |
| Deep Black Spotlight | `bg-black` / `#000` | `#000000` |
| Card Surface | `bg-card` | `#1c1917` |
| Card Border | `border-border` | `#2e2a28` |
| Primary Accent | `bg-primary` / `text-primary` | `#d9a75d` |
| Primary Hover | `bg-accent` / `text-accent` | `#e6b773` |
| Headings | `text-foreground` | `#f5f5f4` |
| Body/Description | `text-muted-foreground` | `#a8a29e` |
| Display Font | `font-display` | Rajdhani |
| Body Font | `font-body` | Outfit |
| Monospace/Specs | `font-mono` | Recursive Mono |
