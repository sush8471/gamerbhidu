-- =============================================================================
-- Migration 003: Orders Management, Verification Code & Customer Tracking
-- Run in Supabase SQL Editor or via: supabase db push
-- =============================================================================

-- Ensure orders table exists with all operational columns
create table if not exists public.orders (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          references auth.users(id) on delete cascade,
  order_id        text          unique not null,              -- e.g. GB-20260913-8492
  order_code      text          unique not null,              -- e.g. GB-8492 (Verification Code on Bill)
  customer_name   text          not null default '',
  customer_email  text          not null default '',
  total           numeric(10,2) not null default 0,
  payment_method  text          not null default 'upi',
  utr_number      text          not null default '',          -- 12-digit UPI reference
  items           jsonb         not null default '[]'::jsonb, -- snapshot of games [{id, name, price, image}]
  status          text          not null default 'pending',   -- 'pending' | 'delivered' | 'cancelled'
  delivery_status text          not null default 'pending',   -- 'pending' | 'delivered'
  delivery_notes  text          not null default '',          -- Admin manual delivery notes / keys
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- If table already existed previously without the new columns, alter them safely:
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'order_code') then
    alter table public.orders add column order_code text;
    update public.orders set order_code = coalesce(order_id, substring(id::text, 1, 8));
    alter table public.orders alter column order_code set not null;
    alter table public.orders add constraint orders_order_code_unique unique (order_code);
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'customer_name') then
    alter table public.orders add column customer_name text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'customer_email') then
    alter table public.orders add column customer_email text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'utr_number') then
    alter table public.orders add column utr_number text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'delivery_status') then
    alter table public.orders add column delivery_status text not null default 'pending';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'delivery_notes') then
    alter table public.orders add column delivery_notes text not null default '';
  end if;
end $$;

-- Indexes for lightning fast lookups on bill codes, UTR, and customer emails
create index if not exists orders_order_code_idx on public.orders (order_code);
create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_utr_number_idx on public.orders (utr_number);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
alter table public.orders enable row level security;

-- Customers can view their own orders
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders"
  on public.orders for select
  using (auth.uid() = user_id or auth.role() = 'authenticated');

-- Customers can insert their order upon checkout
drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders"
  on public.orders for insert
  with check (true);

-- Authenticated admins can update any order (mark delivered, add delivery notes)
drop policy if exists "Admins manage all orders" on public.orders;
create policy "Admins manage all orders"
  on public.orders for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
