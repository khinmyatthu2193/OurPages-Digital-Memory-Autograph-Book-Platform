with missing_users as (
  select
    users.id,
    left(
      coalesce(
        nullif(trim(users.raw_user_meta_data ->> 'display_name'), ''),
        nullif(split_part(users.email, '@', 1), ''),
        'OurPages User'
      ),
      100
    ) as display_name,
    lower(trim(coalesce(users.raw_user_meta_data ->> 'username', ''))) as requested_username
  from auth.users as users
  left join public.profiles as profiles on profiles.id = users.id
  where profiles.id is null
),
ranked_users as (
  select
    missing_users.*,
    count(*) over (partition by requested_username) as requested_username_count
  from missing_users
)
insert into public.profiles (id, display_name, username)
select
  ranked_users.id,
  ranked_users.display_name,
  case
    when ranked_users.requested_username ~ '^[a-z0-9][a-z0-9_]{2,29}$'
      and ranked_users.requested_username <> all (array[
        'admin', 'api', 'login', 'register', 'dashboard', 'settings',
        'help', 'about', 'auth', 'account', 'support', 'privacy', 'terms'
      ])
      and ranked_users.requested_username_count = 1
      and not exists (
        select 1
        from public.profiles as existing_profile
        where existing_profile.username = ranked_users.requested_username
      )
      then ranked_users.requested_username
    else 'user_' || left(replace(ranked_users.id::text, '-', ''), 12)
  end
from ranked_users
on conflict (id) do nothing;
