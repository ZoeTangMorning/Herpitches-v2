-- 个人数据表只允许用户操作自己的记录，重复对象由唯一约束拦截。
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('team', 'player', 'match')),
  target_id text not null,
  target_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, target_type, target_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  article_title text not null,
  article_cover_url text,
  article_type text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, article_id)
);

create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  browser_permission text not null default 'default' check (browser_permission in ('default', 'granted', 'denied', 'unsupported')),
  follow_reminders boolean not null default true,
  major_match_reminders boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.follows enable row level security;
alter table public.favorites enable row level security;
alter table public.notification_settings enable row level security;

create policy "follows_own" on public.follows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notification_settings_own" on public.notification_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
