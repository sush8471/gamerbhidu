-- =============================================================================
-- Migration 001: User Features Schema
-- Run this in your Supabase SQL Editor or via Supabase CLI:
--   supabase db push
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. User Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.user_profiles (
  user_id       uuid        primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  steam_id      text,
  loyalty_tier  text        not null default 'bronze'
                            check (loyalty_tier in ('bronze', 'silver', 'gold', 'platinum')),
  total_spent   numeric(10, 2) not null default 0,
  total_orders  integer       not null default 0,
  birthday      date,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Cart Items (persistent per-user, unique per game)
-- ---------------------------------------------------------------------------
create table if not exists public.cart_items (
  id             uuid          primary key default gen_random_uuid(),
  user_id        uuid          not null references auth.users(id) on delete cascade,
  game_id        text          not null,
  game_name      text          not null,
  price          numeric(10,2) not null,
  image          text,
  original_price numeric(10,2),
  created_at     timestamptz   not null default now(),
  unique(user_id, game_id)
);

-- ---------------------------------------------------------------------------
-- 3. Wishlists
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
  id          uuid          primary key default gen_random_uuid(),
  user_id     uuid          not null references auth.users(id) on delete cascade,
  game_id     text          not null,
  game_name   text          not null,
  image       text,
  price       numeric(10,2),
  created_at  timestamptz   not null default now(),
  unique(user_id, game_id)
);

-- ---------------------------------------------------------------------------
-- 4. Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid          primary key default gen_random_uuid(),
  user_id        uuid          not null references auth.users(id) on delete cascade,
  order_id       text          not null unique,  -- e.g. SR12345678
  status         text          not null default 'pending'
                               check (status in ('pending', 'confirmed', 'delivered', 'cancelled')),
  total          numeric(10,2) not null,
  payment_method text          not null default 'upi',
  items          jsonb         not null,  -- snapshot of ordered items at purchase time
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Game Reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id                uuid    primary key default gen_random_uuid(),
  user_id           uuid    not null references auth.users(id) on delete cascade,
  game_id           text    not null,
  rating            integer not null check (rating between 1 and 5),
  comment           text,
  verified_purchase boolean not null default false,
  created_at        timestamptz not null default now(),
  unique(user_id, game_id)
);

-- ---------------------------------------------------------------------------
-- 6. Purchases (for social proof "X bought today")
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  game_id    text        not null,
  order_id   uuid        references public.orders(id),
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.user_profiles enable row level security;
alter table public.cart_items    enable row level security;
alter table public.wishlists     enable row level security;
alter table public.orders        enable row level security;
alter table public.reviews       enable row level security;
alter table public.purchases     enable row level security;

-- ---------------------------------------------------------------------------
-- user_profiles policies
-- ---------------------------------------------------------------------------
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- cart_items policies
-- ---------------------------------------------------------------------------
create policy "Users manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- wishlists policies
-- ---------------------------------------------------------------------------
create policy "Users manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- orders policies
-- ---------------------------------------------------------------------------
create policy "Users view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reviews policies
-- ---------------------------------------------------------------------------
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Users manage own reviews"
  on public.reviews for all
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- purchases policies
-- ---------------------------------------------------------------------------
create policy "Users view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- =============================================================================
-- Auto-update updated_at timestamps
-- =============================================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();
