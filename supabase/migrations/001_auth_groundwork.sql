-- ============================================================
-- 玄机看事儿 · 鉴权地基重建（2026-08 一次性迁移）
-- 在 Supabase SQL Editor 执行
--
-- ⚠️ users.id 是 bigint（不是 uuid），sessions.user_id 必须同类型。
-- 早期版本这里误写成 uuid，外键建不起来导致整段脚本回滚，
-- 表现为「执行了但 sessions 表和 is_admin 列都没出现」。
-- ============================================================

-- 1) sessions 表
create table if not exists public.sessions (
  token      text primary key,
  user_id    bigint not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

-- 2) users 增加 is_admin 列
alter table public.users add column if not exists is_admin boolean not null default false;

-- 3) 现有管理员置位
update public.users set is_admin = true where phone = '17614130826';
