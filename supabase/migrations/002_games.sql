-- ============================================================
-- 游艺阁 · 互动工具表（2026-09）
-- 在 Supabase SQL Editor 执行
-- 配套：Storage 新建私有 bucket「games」
-- ============================================================

create table if not exists public.games (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text default '',
  file_path    text not null,
  file_size    bigint default 0,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists games_published_idx
  on public.games (is_published, sort_order, created_at desc);

-- 全站读写均走服务端 service-role，不对 anon 开放
alter table public.games enable row level security;
