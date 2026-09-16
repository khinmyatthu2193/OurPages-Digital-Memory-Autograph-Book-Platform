begin;

create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'owner-one@example.test', '{"display_name":"Owner One","username":"owner_one"}'),
  ('22222222-2222-4222-8222-222222222222', 'owner-two@example.test', '{"display_name":"Owner Two","username":"owner_two"}');

insert into public.memories (owner_id, author_name, message)
values
  ('11111111-1111-4111-8111-111111111111', 'Friend', 'For owner one'),
  ('22222222-2222-4222-8222-222222222222', 'Friend', 'For owner two');

select is(
  (select count(*)::integer from public.profiles where id = '11111111-1111-4111-8111-111111111111' and username = 'owner_one'),
  1,
  'Auth registration trigger creates the matching profile'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is((select count(*)::integer from public.memories), 1, 'owner reads only their own memory');
select is(
  (select count(*)::integer from public.memories where owner_id = '22222222-2222-4222-8222-222222222222'),
  0,
  'owner cannot read another owner memory'
);
select lives_ok(
  $$update public.memories set is_favorite = true where owner_id = '11111111-1111-4111-8111-111111111111'$$,
  'owner can update their own memory'
);
select is(
  (select count(*)::integer from public.memories where owner_id = '22222222-2222-4222-8222-222222222222' and is_favorite),
  0,
  'owner cannot update another owner memory'
);

reset role;
update public.profiles set memory_book_status = 'private' where id = '22222222-2222-4222-8222-222222222222';
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select is((select count(*)::integer from public.memories), 0, 'anonymous visitors cannot read memories');

select * from finish();
rollback;
