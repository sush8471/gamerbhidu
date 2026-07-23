# Implementation Plan: Google Sign-In Maximized for Gamer Bhidu

## Phase Overview

| Phase | Scope | Depends On | Est. Effort |
|-------|-------|------------|-------------|
| **1** | Auth Infrastructure + DB Schema | — | Medium |
| **2** | DB-Backed Cart Persistence | Phase 1 | Medium |
| **3** | User Profile + Personalized Navbar | Phase 1 | Low |
| **4** | Checkout Auto-Fill + Order System | Phase 3 | Medium |
| **5** | Wishlist System | Phase 1, 2 | Medium |
| **6** | Social Proof + Reviews | Phase 3 | Medium |
| **7** | Loyalty Program + Rewards | — | Medium |

---

## Phase 1: Auth Infrastructure + Database Schema

**Goal:** Create a centralized `AuthContext` (like `CartContext`) and define all required Supabase tables.

### 1A — Create `src/context/AuthContext.tsx`

Currently auth state is **duplicated** across `gamerbhidu-navbar.tsx:22-37` and `sign-in-prompt.tsx:37-52`. Both independently call `supabase.auth.getSession()` and `onAuthStateChange`. This needs a single source of truth.

```tsx
// src/context/AuthContext.tsx
// Provides: user, session, loading, signIn(), signOut()
// Wraps supabase.auth.getSession + onAuthStateChange in one place
```

**Props to expose:**
- `user` — Supabase `User` object (has `user_metadata.name`, `user_metadata.avatar_url`, `user.email`)
- `session` — full Supabase session
- `loading` — boolean for auth check in progress
- `signIn()` — triggers Google OAuth
- `signOut()` — signs out + redirects
- `isAuthenticated` — computed boolean

### 1B — Add `AuthContext` to Layout

**File:** `src/app/layout.tsx:14-42`

Wrap `<CartProvider>` with `<AuthProvider>` so both cart and auth are available app-wide. Order matters: `AuthProvider` should be outermost since cart depends on auth.

```tsx
<AuthProvider>
  <CartProvider>
    <SearchProvider>
      {children}
      ...
    </SearchProvider>
  </CartProvider>
</AuthProvider>
```

### 1C — Refactor Navbar to use `AuthContext`

**File:** `src/components/sections/gamerbhidu-navbar.tsx`

Remove the 20+ lines of local auth state (`useState`, `useEffect` for `getSession`, listener). Replace with:

```tsx
const { user, isAuthenticated, loading, signIn, signOut } = useAuth();
```

### 1D — Refactor SignInPrompt to use `AuthContext`

**File:** `src/components/ui/sign-in-prompt.tsx`

Same refactor — remove local auth state, use `useAuth()`.

### 1E — Supabase Migration: Create Tables

**File:** `supabase/migrations/001_user_features.sql` (new)

```sql
-- 1. User profiles (extends Supabase auth.users)
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  steam_id text,
  loyalty_tier text default 'bronze' check (loyalty_tier in ('bronze','silver','gold','platinum')),
  total_spent numeric(10,2) default 0,
  total_orders integer default 0,
  birthday date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Cart items (persistent per-user)
create table public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  game_name text not null,
  price numeric(10,2) not null,
  image text,
  original_price numeric(10,2),
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

-- 3. Wishlists
create table public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  game_name text not null,
  image text,
  price numeric(10,2),
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

-- 4. Orders
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text unique not null, -- e.g. SR12345678
  status text default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  total numeric(10,2) not null,
  payment_method text default 'upi',
  items jsonb not null, -- snapshot of ordered items
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Game reviews
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

-- 6. Purchase history (for "X bought today" social proof)
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  order_id uuid references public.orders(id),
  created_at timestamptz default now()
);
```

### 1F — Row Level Security Policies

```sql
alter table public.user_profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.purchases enable row level security;

-- user_profiles: users see/update own, admin sees all
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = user_id);

-- cart_items: users manage own only
create policy "Users manage own cart" on public.cart_items
  for all using (auth.uid() = user_id);

-- wishlists: users manage own, public read for counts
create policy "Users manage own wishlist" on public.wishlists
  for all using (auth.uid() = user_id);

-- orders: users see own, admin sees all
create policy "Users view own orders" on public.orders
  for select using (auth.uid() = user_id);

-- reviews: public read, users manage own
create policy "Anyone can read reviews" on public.reviews
  for select using (true);
create policy "Users manage own reviews" on public.reviews
  for all using (auth.uid() = user_id);

-- purchases: system-facing
create policy "Users view own purchases" on public.purchases
  for select using (auth.uid() = user_id);
```

### 1G — Auto-create Profile on First Sign-In

**File:** new `src/lib/auth-hooks.ts`

```ts
// Listen for auth state change, check if user_profiles row exists
// If not, create one from Google metadata:
//   display_name from user_metadata.full_name
//   avatar_url from user_metadata.avatar_url
//   user_id from user.id
```

This gets called once when `AuthContext` detects a new authenticated session without a profile row.

### 1H — Create `src/lib/db/cart-db.ts`

```ts
// getCartItems(userId) — fetch all cart_items for user
// addCartItem(userId, item) — insert
// removeCartItem(userId, gameId) — delete
// clearCart(userId) — delete all for user
// mergeLocalCart(userId, localItems) — upsert localStorage items into DB
```

### 1I — Create `src/lib/db/user-db.ts`

```ts
// getProfile(userId) — fetch user_profiles
// upsertProfile(userId, data) — insert or update
// updateSteamId(userId, steamId) — set steam_id
// updateLoyalty(userId, orderTotal) — increment total_spent, recalc tier
```

### Deliverables for Phase 1

- [ ] `src/context/AuthContext.tsx`
- [ ] `src/app/layout.tsx` updated with `<AuthProvider>`
- [ ] `src/components/sections/gamerbhidu-navbar.tsx` refactored
- [ ] `src/components/ui/sign-in-prompt.tsx` refactored
- [ ] `supabase/migrations/001_user_features.sql`
- [ ] `src/lib/auth-hooks.ts` (auto-profile creation)
- [ ] `src/lib/db/cart-db.ts`
- [ ] `src/lib/db/user-db.ts`
- [ ] No breaking changes — everything works as before, just cleaner

---

## Phase 2: DB-Backed Cart Persistence

**Goal:** Cart survives across devices. LocalStorage becomes a cache, Supabase becomes the source of truth.

### 2A — Refactor `CartContext.tsx`

**File:** `src/context/CartContext.tsx`

Current flow:
1. On mount → read localStorage
2. On change → write localStorage

New flow:
1. On mount → read localStorage (for instant UI)
2. On auth ready → if authenticated, fetch DB cart, **merge** with localStorage, clear localStorage
3. On add/remove → write to both localStorage AND DB
4. On sign-out → clear localStorage cart

**Key merge logic:**

```ts
// If localStorage has {gta-v, ac-valhalla} and DB has {gta-v, gta-iv}
// Merged result: {gta-v, ac-valhalla, gta-iv}
// Deduplicate by game_id, keep DB prices if conflict
```

### 2B — Add `isAuthenticated` dependency to CartContext

```tsx
const { user, isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated && user) {
    // Load DB cart and merge
    loadAndMergeCart(user.id);
  }
}, [isAuthenticated, user]);
```

### 2C — Update Cart Functions to be DB-aware

```ts
const addToCart = useCallback(async (item: CartItem) => {
  setCart(prev => [...prev, item]);
  if (isAuthenticated && user) {
    await addCartItem(user.id, item);
  }
}, [isAuthenticated, user]);
```

### 2D — Add Toast Feedback on Cart Actions

Use the existing `sonner` toast library (already installed) to show:
- "Added to cart" on add
- "Removed from cart" on remove
- "Cart synced" on merge completion

### Deliverables for Phase 2

- [ ] `src/context/CartContext.tsx` refactored with DB sync
- [ ] Cart merge logic tested (localStorage → DB)
- [ ] Toast notifications on cart actions
- [ ] No breaking changes — unauthenticated users still get localStorage cart

---

## Phase 3: User Profile + Personalized Navbar

**Goal:** Show user's Google name/avatar, make the experience feel personal.

### 3A — Update Navbar for Authenticated State

**File:** `src/components/sections/gamerbhidu-navbar.tsx`

Currently the navbar shows a generic User icon when signed in. Enhance:
- Show Google avatar (circular) instead of generic icon
- Show first name ("Hey, Sushant") on desktop
- Dropdown shows full name, email, avatar
- "My Orders" link in dropdown
- "Wishlist" link in dropdown

### 3B — Add Profile Avatar Component

**File:** new `src/components/ui/user-avatar.tsx`

```tsx
// Takes: name, avatarUrl, size
// Shows: Circular avatar with fallback to initials
// Uses: existing @radix-ui/react-avatar
```

### 3C — Update Sign-In Prompt with Personalized Context

**File:** `src/components/ui/sign-in-prompt.tsx`

Enhance copy after user has items in cart:
- "Sign in to save your cart across devices"
- "Sign in to track your orders"
- Show cart item count in the prompt

### 3D — Profile Dropdown Menu

```
┌─────────────────────────────┐
│  [Avatar] Sushant           │
│  sushant@gmail.com          │
├─────────────────────────────┤
│  🎮 My Orders               │
│  ❤️ Wishlist                │
│  🏆 My Rewards              │
│  ⚙️ Profile Settings        │
├─────────────────────────────┤
│  🚪 Sign Out                │
└─────────────────────────────┘
```

### Deliverables for Phase 3

- [ ] `src/components/ui/user-avatar.tsx`
- [ ] Navbar updated with avatar, dropdown, profile links
- [ ] Sign-in prompt updated with cart context
- [ ] Profile dropdown menu with all navigation links

---

## Phase 4: Checkout Auto-Fill + Order System

**Goal:** Use Google profile data to pre-fill checkout. Create the order flow.

### 4A — Create `/checkout` Page

**File:** new `src/app/checkout/page.tsx`

```
┌──────────────────────────────────────────┐
│  Checkout                                │
├──────────────────────────────────────────┤
│  Contact Info (auto-filled from Google)  │
│  ┌────────────┐ ┌────────────┐          │
│  │ Name       │ │ Email      │          │
│  │ Sushant    │ │ s@ gmail   │          │
│  └────────────┘ └────────────┘          │
│                                          │
│  Order Summary (from CartContext)        │
│  ┌──────────────────────────────┐       │
│  │ GTA V           ₹299        │       │
│  │ AC Valhalla     ₹279        │       │
│  │ ─────────────────────────    │       │
│  │ Total:          ₹578        │       │
│  └──────────────────────────────┘       │
│                                          │
│  [QR Code + UPI]  ← reuse existing code │
│  [I have paid checkbox]                 │
│  [WhatsApp] / [Instagram]              │
└──────────────────────────────────────────┘
```

### 4B — Extract Checkout Logic from Cart Page

Currently `src/app/cart/page.tsx:19-56` has inline checkout logic (QR, WhatsApp, Instagram). Extract this into:

**File:** new `src/components/ui/checkout-modal.tsx`

Reusable component that receives:
- `orderId`
- `items`
- `totalPrice`
- `userEmail` (from auth)
- `userName` (from auth)

### 4C — Create Order in DB on Checkout

**File:** new `src/lib/db/order-db.ts`

```ts
createOrder(userId, items, total) → creates row in `orders` table
updateOrderStatus(orderId, status) → for admin use
getUserOrders(userId) → returns order history
getOrderById(orderId, userId) → single order detail
```

### 4D — Update Cart Page to Redirect to Checkout

Replace the inline modal with a proper checkout flow:
1. Cart page → shows cart items
2. "Proceed to Checkout" → goes to `/checkout`
3. Checkout page → shows auto-filled info + QR
4. On confirm → creates order in DB + opens WhatsApp

### 4E — Auto-Fill Checkout from Google Profile

```tsx
const { user } = useAuth();
const userName = user?.user_metadata?.full_name || '';
const userEmail = user?.email || '';

// Pre-fill form fields
<input defaultValue={userName} />
<input defaultValue={userEmail} />
```

### Deliverables for Phase 4

- [ ] `src/app/checkout/page.tsx`
- [ ] `src/components/ui/checkout-modal.tsx` (extracted from cart)
- [ ] `src/lib/db/order-db.ts`
- [ ] Cart page updated to link to checkout
- [ ] Checkout auto-fills name/email from Google

---

## Phase 5: Wishlist System

**Goal:** Let users save games to wishlist, persisted to Supabase.

### 5A — Create `src/context/WishlistContext.tsx`

Similar pattern to `CartContext`:

```tsx
interface WishlistItem {
  gameId: string;
  gameName: string;
  image: string;
  price: number | null;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (gameId: string) => void;
  isInWishlist: (gameId: string) => boolean;
  count: number;
}
```

DB sync follows same pattern as CartContext (localStorage for guest, DB for authenticated).

### 5B — Create Wishlist DB Functions

**File:** new `src/lib/db/wishlist-db.ts`

```ts
getWishlist(userId) → fetch all
toggleWishlist(userId, item) → add or remove
isInWishlist(userId, gameId) → boolean check
```

### 5C — Add Wishlist Button to Game Cards

**File:** `src/components/sections/game-cards-grid-discover.tsx` and other game card components

Add a heart icon button on each game card:
- Empty heart → not in wishlist
- Filled heart → in wishlist
- Click toggles wishlist state
- Requires auth → if not signed in, redirect to Google OAuth

### 5D — Create `/wishlist` Page

**File:** new `src/app/wishlist/page.tsx`

Grid of wishlisted games. Each game shows:
- Game image + title + price
- "Add to Cart" button
- "Remove from Wishlist" button
- Empty state if no wishlisted games

### 5E — Add Wishlist Link to Navbar Dropdown

From Phase 3's dropdown menu design.

### Deliverables for Phase 5

- [ ] `src/context/WishlistContext.tsx`
- [ ] `src/lib/db/wishlist-db.ts`
- [ ] Wishlist heart button on all game cards
- [ ] `src/app/wishlist/page.tsx`
- [ ] Wishlist link in navbar dropdown
- [ ] Layout.tsx updated with `<WishlistProvider>`

---

## Phase 6: Social Proof + Reviews

**Goal:** Build trust with verified purchaser reviews and real-time activity.

### 6A — Create Review System

**File:** new `src/components/ui/review-card.tsx`

```tsx
// Shows: reviewer name, avatar, rating (stars), comment, "Verified Purchase" badge
// Only Google-authenticated users who purchased the game can review
```

### 6B — Create `/games/[slug]/reviews` Section

**File:** new `src/components/sections/game-reviews.tsx`

- Rating distribution bar chart
- List of reviews with star ratings
- "Write a Review" button (only for purchasers)
- Average rating displayed on game card

### 6C — Review Form (Modal)

```tsx
// Requires: authentication + verified purchase
// Fields: rating (1-5 stars), comment
// Shows user's Google avatar + name
```

### 6D — "X Gamers Bought Today" Counter

**File:** new `src/lib/db/purchase-db.ts`

```ts
getRecentPurchaseCount(gameId, hours = 24) → count of purchases in last 24h
getRecentPurchases(hours = 24) → list of recently bought games
```

Display on game cards:

```
🔥 12 people bought this today
```

### 6E — Social Proof Section Update

**File:** `src/components/sections/social-proof.tsx`

Enhance existing social proof with:
- Real purchase data (not hardcoded)
- Recent reviews
- Live purchase notifications (if scope allows)

### Deliverables for Phase 6

- [ ] `src/components/ui/review-card.tsx`
- [ ] `src/components/sections/game-reviews.tsx`
- [ ] `src/components/ui/review-form.tsx`
- [ ] `src/lib/db/purchase-db.ts`
- [ ] "X bought today" on game cards
- [ ] Social proof updated with real data

---

## Phase 7: Loyalty Program + Rewards

**Goal:** Reward repeat customers with tiered benefits.

### 7A — Loyalty Tier Calculation

**File:** new `src/lib/db/loyalty-db.ts`

```ts
// Tiers based on total_spent:
// Bronze: ₹0 - ₹999
// Silver: ₹1,000 - ₹4,999
// Gold: ₹5,000 - ₹14,999
// Platinum: ₹15,000+

calculateTier(totalSpent) → 'bronze' | 'silver' | 'gold' | 'platinum'
getTierBenefits(tier) → { discount, badge, perks }
```

### 7B — Tier-Based Discounts

```
Bronze:  0% (base prices)
Silver:  2% additional discount
Gold:    5% additional discount
Platinum: 10% additional discount
```

Apply automatically at checkout based on user's `loyalty_tier`.

### 7C — Create `/rewards` Page

**File:** new `src/app/rewards/page.tsx`

```
┌──────────────────────────────────────────┐
│  🏆 Your Rewards                         │
├──────────────────────────────────────────┤
│  Current Tier: 🥈 Silver                 │
│  Progress: ████████░░ 60% to Gold        │
│  ₹2,050 more to reach Gold tier          │
│                                          │
│  Your Benefits:                          │
│  ✓ 2% extra discount on all games        │
│  ✓ Early access to new releases          │
│  ✓ Priority support                      │
│                                          │
│  Milestone Rewards:                      │
│  ✓ First Order Completed                 │
│  ✓ ₹1,000 Spent                         │
│  ✓ 5 Games Purchased                     │
│  ○ ₹5,000 Spent (locked)                │
│  ○ Leave 3 Reviews (locked)              │
└──────────────────────────────────────────┘
```

### 7D — Birthday Reward

If user provides birthday (optional in profile settings):
- Auto-detect on birthday month
- Send special discount code
- "Happy Birthday! Here's 20% off"

### Deliverables for Phase 7

- [ ] `src/lib/db/loyalty-db.ts`
- [ ] `src/app/rewards/page.tsx`
- [ ] Tier-based discounts applied at checkout
- [ ] Birthday detection + reward
- [ ] Milestone tracking UI

---

## Review & Quality Gates

After **each phase**, run these checks:

```bash
npm run lint          # ESLint
npm run build         # Next.js build (catches TS errors)
```

### Code Review Checklist per Phase

- [ ] No `any` types introduced
- [ ] All DB queries have error handling
- [ ] RLS policies are correct (users can only access own data)
- [ ] Auth context doesn't cause unnecessary re-renders
- [ ] localStorage ↔ DB sync handles edge cases (network failure, offline)
- [ ] All new pages have loading states
- [ ] All new pages have empty states
- [ ] No secrets in client-side code

---

## File Structure After All Phases

```
src/
├── app/
│   ├── admin/(dashboard)/
│   ├── api/steam/
│   ├── cart/page.tsx              (modified)
│   ├── checkout/page.tsx          (new - Phase 4)
│   ├── rewards/page.tsx           (new - Phase 7)
│   ├── wishlist/page.tsx          (new - Phase 5)
│   └── layout.tsx                 (modified)
├── components/
│   ├── sections/
│   │   ├── game-reviews.tsx       (new - Phase 6)
│   │   ├── gamerbhidu-navbar.tsx  (modified)
│   │   └── social-proof.tsx       (modified)
│   └── ui/
│       ├── checkout-modal.tsx     (new - Phase 4)
│       ├── review-card.tsx        (new - Phase 6)
│       ├── review-form.tsx        (new - Phase 6)
│       ├── sign-in-prompt.tsx     (modified)
│       ├── user-avatar.tsx        (new - Phase 3)
│       └── wishlist-button.tsx    (new - Phase 5)
├── context/
│   ├── AuthContext.tsx            (new - Phase 1)
│   ├── CartContext.tsx            (modified - Phase 2)
│   ├── SearchContext.tsx
│   └── WishlistContext.tsx        (new - Phase 5)
└── lib/
    ├── db/
    │   ├── cart-db.ts             (new - Phase 1)
    │   ├── loyalty-db.ts          (new - Phase 7)
    │   ├── order-db.ts            (new - Phase 4)
    │   ├── purchase-db.ts         (new - Phase 6)
    │   ├── user-db.ts             (new - Phase 1)
    │   └── wishlist-db.ts         (new - Phase 5)
    ├── auth-hooks.ts              (new - Phase 1)
    ├── local-db.ts
    ├── steam-api.ts
    └── supabase.ts
supabase/
└── migrations/
    └── 001_user_features.sql      (new - Phase 1)
```
