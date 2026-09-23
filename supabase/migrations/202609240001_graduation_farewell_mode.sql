do $$
begin
  create type public.memory_book_mode as enum ('standard', 'graduation');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists memory_book_mode public.memory_book_mode not null default 'standard',
  add column if not exists graduation_title varchar(120),
  add column if not exists graduation_class varchar(120),
  add column if not exists graduation_year smallint,
  add column if not exists graduation_message varchar(600);

alter table public.profiles
  add constraint profiles_graduation_title_length
    check (graduation_title is null or char_length(trim(graduation_title)) between 1 and 120),
  add constraint profiles_graduation_class_length
    check (graduation_class is null or char_length(trim(graduation_class)) between 1 and 120),
  add constraint profiles_graduation_year_range
    check (graduation_year is null or graduation_year between 1900 and 2200),
  add constraint profiles_graduation_message_length
    check (graduation_message is null or char_length(trim(graduation_message)) between 1 and 600);

-- Keep anonymous table access limited to fields intentionally shown publicly.
revoke select on table public.profiles from anon;
grant select (
  display_name,
  username,
  bio,
  avatar_url,
  memory_book_status,
  memory_book_mode,
  graduation_title,
  graduation_class,
  graduation_year,
  graduation_message
) on table public.profiles to anon;

insert into public.prompts (text, category)
values
  ('What is one memory of us you will never forget?', 'graduation'),
  ('What will you miss the most?', 'graduation'),
  ('What is one thing you want me to remember?', 'graduation'),
  ('What was your favorite moment together?', 'graduation'),
  ('Leave a message for the next chapter of my life.', 'graduation'),
  ('If you could describe our years together in one sentence, what would it be?', 'graduation')
on conflict do nothing;
