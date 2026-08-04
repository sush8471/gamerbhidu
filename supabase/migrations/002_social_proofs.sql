-- =============================================================================
-- Migration 002: Social Proofs (Trusted by Indian Gamers)
-- Run in Supabase SQL Editor or via: supabase db push
-- =============================================================================

create table if not exists public.social_proofs (
  id            uuid        primary key default gen_random_uuid(),
  image_url     text        not null,
  label         text        not null default '',
  tag           text        not null default 'Order Delivered',
  display_order integer     not null default 0,
  visible       boolean     not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists social_proofs_display_order_idx
  on public.social_proofs (display_order);

create index if not exists social_proofs_visible_idx
  on public.social_proofs (visible);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.social_proofs enable row level security;

drop policy if exists "Anyone can read visible social proofs" on public.social_proofs;
create policy "Anyone can read visible social proofs"
  on public.social_proofs for select
  using (visible = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users manage social proofs" on public.social_proofs;
create policy "Authenticated users manage social proofs"
  on public.social_proofs for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- Seed existing homepage proofs (skip if table already has rows)
-- =============================================================================

insert into public.social_proofs (image_url, label, tag, display_order, visible)
select * from (values
  (
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123151-1765869145884.jpg?width=8000&height=8000&resize=contain',
    '3 Games Deal Delivered',
    'Order Delivered',
    1,
    true
  ),
  (
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123138-1765869145631.jpg?width=8000&height=8000&resize=contain',
    'Subnautica Deal Executed',
    'Verified Deal',
    2,
    true
  ),
  (
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123143-1765869145725.jpg?width=8000&height=8000&resize=contain',
    'Mortal Kombat 11 Deal Closed',
    'Order Delivered',
    3,
    true
  ),
  (
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123154-1765869145644.jpg?width=8000&height=8000&resize=contain',
    'Spiderman Miles Morales Deal',
    'Order Delivered',
    4,
    true
  ),
  (
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123149-1765869146049.jpg?width=8000&height=8000&resize=contain',
    '7 AAA Games Ultimate Deal',
    'Verified Deal',
    5,
    true
  ),
  (
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Screenshot_20251216_123226-1765869176515.jpg?width=8000&height=8000&resize=contain',
    'Mega Holi Deal 25 Games',
    'Order Delivered',
    6,
    true
  ),
  ('/proof-1.jpg', 'Cyberpunk & Mafia Deal', 'Order Delivered', 7, true),
  ('/proof-2.jpg', 'Truck Simulator Bundle', 'Verified Deal', 8, true),
  ('/proof-3.jpg', '5 AAA Games Package', 'Order Delivered', 9, true),
  ('/proof-4.jpg', 'Batman Arkham Origins', 'Verified Deal', 10, true),
  ('/proof-5.jpg', 'Red Dead Redemption 2', 'Order Delivered', 11, true),
  ('/proof-7.jpg', 'Last of Us Deal', 'Verified Deal', 12, true),
  ('/proof-8.jpg', 'God of War Ragnarok', 'Order Delivered', 13, true),
  ('/proof-9.jpg', 'RDR 2 Deal Completed', 'Verified Deal', 14, true),
  ('/proof-10.jpg', 'GOW Ragnarok Bundle', 'Order Delivered', 15, true),
  ('/proof-11.jpg', 'The Last Of Us Part 1', 'Verified Deal', 16, true),
  ('/proof-12.jpg', '+4 Games Deal', 'Order Delivered', 17, true),
  ('/proof-13.jpg', '+4 Premium Games', 'Verified Deal', 18, true),
  ('/proof-14.jpg', '6 Games Deal', 'Order Delivered', 19, true),
  ('/proof-15.jpg', 'Red Dead Redemption 1', 'Verified Deal', 20, true),
  ('/proof-16.jpg', 'Cyberpunk 2077', 'Order Delivered', 21, true),
  ('/proof-17.jpg', 'Ghost Of Tsushima - 6 Games in 400', 'Epic Deal', 22, true),
  ('/proof-18.jpg', 'God Of War Ragnarok', 'Verified Deal', 23, true),
  ('/proof-19.jpg', 'God Of War', 'Order Delivered', 24, true),
  ('/proof-20.jpg', 'Mega Holi Deal 25 Games', 'Epic Deal', 25, true),
  ('/proof-21.jpg', 'Black Myth Wukong', 'Verified Deal', 26, true),
  ('/proof-22.jpg', 'Mega Holi Deal', 'Order Delivered', 27, true)
) as v(image_url, label, tag, display_order, visible)
where not exists (select 1 from public.social_proofs limit 1);
