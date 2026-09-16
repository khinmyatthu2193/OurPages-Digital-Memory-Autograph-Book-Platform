create extension if not exists pgcrypto;

do $$
begin
  create type public.memory_book_status as enum ('open', 'closed', 'private');
exception
  when duplicate_object then null;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(100) not null check (char_length(trim(display_name)) between 1 and 100),
  username varchar(30) not null,
  bio varchar(500),
  avatar_url varchar(2048),
  memory_book_status public.memory_book_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_normalized check (username = lower(username)),
  constraint profiles_username_format check (username ~ '^[a-z0-9][a-z0-9_]{2,29}$'),
  constraint profiles_username_not_reserved check (
    username <> all (array[
      'admin', 'api', 'login', 'register', 'dashboard', 'settings',
      'help', 'about', 'auth', 'account', 'support', 'privacy', 'terms'
    ])
  ),
  constraint profiles_username_unique unique (username)
);

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  text varchar(300) not null unique check (char_length(trim(text)) between 1 and 300),
  category varchar(50) not null check (category in ('memory', 'friendship', 'graduation', 'future', 'fun')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  author_name varchar(100),
  message varchar(5000) not null check (char_length(trim(message)) between 1 and 5000),
  is_anonymous boolean not null default false,
  prompt_id uuid references public.prompts(id) on delete set null,
  photo_url varchar(2048),
  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_author_name_required check (
    is_anonymous or char_length(trim(coalesce(author_name, ''))) between 1 and 100
  )
);

create index memories_owner_created_idx on public.memories (owner_id, created_at desc);
create index memories_owner_visibility_created_idx on public.memories (owner_id, is_hidden, created_at desc);
create index memories_prompt_idx on public.memories (prompt_id);
create index prompts_active_category_idx on public.prompts (is_active, category);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger prompts_set_updated_at before update on public.prompts
for each row execute function public.set_updated_at();
create trigger memories_set_updated_at before update on public.memories
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')),
    lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')))
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.memories enable row level security;

create policy "Public profiles are readable when book is visible"
on public.profiles for select
using (memory_book_status <> 'private' or auth.uid() = id);

create policy "Owners update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

create policy "Active prompts are publicly readable"
on public.prompts for select using (is_active = true);

create policy "Owners read their own memories"
on public.memories for select to authenticated using (auth.uid() = owner_id);

create policy "Owners update their own memories"
on public.memories for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owners delete their own memories"
on public.memories for delete to authenticated using (auth.uid() = owner_id);

revoke insert on table public.memories from anon, authenticated;
revoke insert, update, delete on table public.prompts from anon, authenticated;
revoke insert, delete on table public.profiles from anon, authenticated;

comment on table public.memories is
  'Private by default. Guest inserts pass through the validated Express API; no public INSERT policy exists.';
