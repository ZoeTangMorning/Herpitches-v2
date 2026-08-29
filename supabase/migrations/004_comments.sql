-- 评论只挂在新闻文章下；parent_id 允许一层回复。
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  content text not null check (char_length(content) between 2 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'deleted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists comments_article_idx on public.comments (article_id, created_at);
create index if not exists comments_user_idx on public.comments (user_id, created_at desc);

-- 这个触发器保证回复只能有一层，并且回复必须属于同一篇文章。
create or replace function public.ensure_one_level_comment()
returns trigger
language plpgsql
as $$
declare
  parent_article text;
  parent_parent uuid;
begin
  if new.parent_id is null then
    return new;
  end if;
  select article_id, parent_id into parent_article, parent_parent
  from public.comments
  where id = new.parent_id;
  if parent_article is null or parent_article <> new.article_id or parent_parent is not null then
    raise exception 'invalid parent comment';
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_one_level_comment_trigger on public.comments;
create trigger ensure_one_level_comment_trigger
  before insert or update on public.comments
  for each row execute procedure public.ensure_one_level_comment();

alter table public.comments enable row level security;

drop policy if exists "comments_select_public_or_own" on public.comments;
create policy "comments_select_public_or_own" on public.comments
  for select using (status = 'approved' or auth.uid() = user_id);

drop policy if exists "comments_insert_own_pending" on public.comments;
create policy "comments_insert_own_pending" on public.comments
  for insert with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "comments_update_own_delete" on public.comments;
create policy "comments_update_own_delete" on public.comments
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = 'deleted');

-- 举报表只给用户端创建和查看自己的举报；处理流程留给人工。
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'misinformation', 'other')),
  detail text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, comment_id)
);

alter table public.reports enable row level security;

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports
  for select using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = user_id);
