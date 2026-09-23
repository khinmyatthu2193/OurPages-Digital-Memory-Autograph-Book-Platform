-- Phase 7: one optional, privately stored photo per memory.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'memories' and column_name = 'photo_url'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'memories' and column_name = 'photo_path'
  ) then
    alter table public.memories rename column photo_url to photo_path;
  end if;
end $$;

alter table public.memories add column if not exists submission_token uuid;

create unique index if not exists memories_submission_token_idx
  on public.memories (owner_id, submission_token)
  where submission_token is not null;

comment on column public.memories.photo_path is
  'Private memory-photos bucket object path. Never expose this path through public APIs.';
comment on column public.memories.submission_token is
  'Optional client-generated idempotency token used to make guest submission retries safe.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-photos', 'memory-photos', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No anon/authenticated storage.objects policies are intentional. Uploads,
-- signed reads, and cleanup pass through the server-only service-role client.
