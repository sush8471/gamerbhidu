-- =============================================================================
-- Migration 003: Orders Management, Verification Code & Customer Tracking
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- =============================================================================

-- 1. Create table if it doesn't exist
create table if not exists public.orders (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          references auth.users(id) on delete cascade,
  order_id        text          not null default '',
  order_code      text          not null default '',
  customer_name   text          not null default '',
  customer_email  text          not null default '',
  total           numeric(10,2) not null default 0,
  payment_method  text          not null default 'upi',
  utr_number      text          not null default '',
  items           jsonb         not null default '[]'::jsonb,
  status          text          not null default 'pending',
  delivery_status text          not null default 'pending',
  delivery_notes  text          not null default '',
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- 2. Safely add any missing columns if the table already existed with older schema
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'order_id') then
    alter table public.orders add column order_id text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'order_code') then
    alter table public.orders add column order_code text;
    update public.orders set order_code = 'GB-' || upper(substring(replace(id::text, '-', ''), 1, 4)) where order_code is null or order_code = '';
    alter table public.orders alter column order_code set not null;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_name') then
    alter table public.orders add column customer_name text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_email') then
    alter table public.orders add column customer_email text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'utr_number') then
    alter table public.orders add column utr_number text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'items') then
    alter table public.orders add column items jsonb not null default '[]'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'delivery_status') then
    alter table public.orders add column delivery_status text not null default 'pending';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'delivery_notes') then
    alter table public.orders add column delivery_notes text not null default '';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'total') then
    alter table public.orders add column total numeric(10,2) not null default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_method') then
    alter table public.orders add column payment_method text not null default 'upi';
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'status') then
    alter table public.orders add column status text not null default 'pending';
  end if;
end $$;

-- 3. Indexes for fast lookups
create index if not exists orders_order_code_idx on public.orders (order_code);
create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_utr_number_idx on public.orders (utr_number);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- 4. Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- 5. Drop old policies to avoid duplicate errors
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Users insert own orders" on public.orders;
drop policy if exists "Admins manage all orders" on public.orders;
drop policy if exists "Allow order placement" on public.orders;
drop policy if exists "Allow read orders" on public.orders;
drop policy if exists "Allow update orders" on public.orders;

-- 6. Recreate clean, permissive policies
-- Customers / guests can insert orders upon checkout
create policy "Allow order placement"
  on public.orders for insert
  to public
  with check (true);

-- Admins and users can read orders
create policy "Allow read orders"
  on public.orders for select
  to public
  using (true);

-- Admins can update delivery status & notes
create policy "Allow update orders"
  on public.orders for update
  to public
  using (true)
  with check (true);

-- 7. Ensure roles have access
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.orders to anon, authenticated, service_role;
