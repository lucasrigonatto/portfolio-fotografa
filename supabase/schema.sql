create extension if not exists "pgcrypto";

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  requested_slot text not null,
  service_type text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists booking_requests_created_at_idx
  on public.booking_requests (created_at desc);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  place text not null,
  description text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_items_created_at_idx
  on public.portfolio_items (created_at desc);
