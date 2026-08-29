-- 社区帖子是真实用户内容：默认即时公开，发帖权限限制在总社区和用户已关注的球队/球员社区。
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id text not null,
  community_kind text not null check (community_kind in ('official', 'team', 'player')),
  author_name text not null,
  content text not null check (char_length(content) between 2 and 500),
  status text not null default 'approved' check (status in ('approved', 'deleted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_posts_feed_idx
  on public.community_posts (community_id, status, created_at desc);

create index if not exists community_posts_user_idx
  on public.community_posts (user_id, created_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "community_posts_select_public_or_own" on public.community_posts;
create policy "community_posts_select_public_or_own" on public.community_posts
  for select using (status = 'approved' or auth.uid() = user_id);

drop policy if exists "community_posts_insert_own_allowed_community" on public.community_posts;
create policy "community_posts_insert_own_allowed_community" on public.community_posts
  for insert with check (
    auth.uid() = user_id
    and status = 'approved'
    and (
      (community_kind = 'official' and community_id = 'herpitches')
      or exists (
        select 1
        from public.follows
        where follows.user_id = auth.uid()
          and follows.target_type = community_kind
          and community_posts.community_id = follows.target_type || '-' || follows.target_id
      )
    )
  );

alter table public.likes
  drop constraint if exists likes_target_type_check;

alter table public.likes
  add constraint likes_target_type_check check (target_type in ('article', 'comment', 'post'));
