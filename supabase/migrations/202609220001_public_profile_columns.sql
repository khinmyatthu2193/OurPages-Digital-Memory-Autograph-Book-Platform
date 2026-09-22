-- Anonymous readers need public profile fields, but never the Auth user ID.
revoke select on table public.profiles from anon;
grant select (display_name, username, bio, avatar_url, memory_book_status)
on table public.profiles to anon;
