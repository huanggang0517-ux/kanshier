-- ============================================================
-- 玄机看事儿 · 鉴权地基重建（2026-08 一次性迁移）
-- 在 Supabase SQL Editor 执行
-- ============================================================

-- 1) sessions 表
create table if not exists public.sessions (
  token      text primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

-- 2) users 增加 is_admin 列
alter table public.users add column if not exists is_admin boolean not null default false;

-- 3) 现有管理员置位
update public.users set is_admin = true where phone = '17614130826';
