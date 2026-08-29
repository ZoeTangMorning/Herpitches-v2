-- 点赞表记录用户对新闻或评论的点赞。
-- target_id 用 text，是为了兼容当前 mock 新闻 ID 和未来真实文章 ID。
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('article', 'comment')),
  target_id text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, target_type, target_id)
);

create index if not exists likes_target_idx
  on public.likes (target_type, target_id);

alter table public.likes enable row level security;

drop policy if exists "likes_select_public" on public.likes;
create policy "likes_select_public" on public.likes
  for select using (true);

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);
