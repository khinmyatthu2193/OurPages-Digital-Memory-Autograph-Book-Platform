# Database Design

The source of truth is `supabase/migrations/202609150001_phase_2_foundation.sql`. Supabase PostgreSQL is accessed through `@supabase/supabase-js`; the earlier standalone Prisma user/password model has been removed.

## Relationships

```text
auth.users 1 ── 1 profiles 1 ── * memories * ── 0..1 prompts
```

Deleting an Auth user cascades to the profile and owned memories. Deleting a prompt sets `memories.prompt_id` to null.

## Tables

`profiles` contains the Auth UUID primary/foreign key, display name, unique normalized username, optional bio/avatar URL, `open | closed | private` book status, and timestamps. It contains no email, password, or credential fields. Usernames are 3–30 lowercase URL-safe characters, must begin with a letter/number, and cannot use the maintained reserved list in the migration and validators.

`memories` contains a UUID, required owner, optional author name for anonymous submissions, message, anonymity flag, optional prompt/photo URL, owner moderation flags, and timestamps. Checks require a nonblank 1–5000-character message and an author name for non-anonymous messages.

`prompts` contains a UUID, unique prompt text, category, active flag, and timestamps. Allowed initial categories are `memory`, `friendship`, `graduation`, `future`, and `fun`.

All three tables use triggers to maintain `updated_at`. Registration uses a security-definer trigger with an empty search path to create exactly one profile for each new Auth user.

## Indexes

- Unique profile username index/constraint
- Unique prompt text constraint (also makes seeding repeatable)
- `(owner_id, created_at desc)` for owner inbox ordering
- `(owner_id, is_hidden, created_at desc)` for visibility filtering
- `prompt_id` for memory/prompt joins
- `(is_active, category)` for prompt selection

## RLS policies

RLS is enabled on every application table.

| Table    | Operation | Rule                                                              |
| -------- | --------- | ----------------------------------------------------------------- |
| profiles | SELECT    | Public for open/closed books; owner can also read private profile |
| profiles | UPDATE    | `auth.uid() = id` in both `USING` and `WITH CHECK`                |
| prompts  | SELECT    | Active prompts only                                               |
| memories | SELECT    | `auth.uid() = owner_id`                                           |
| memories | UPDATE    | Owner match in `USING` and `WITH CHECK`                           |
| memories | DELETE    | Owner match                                                       |

There is no public memory SELECT or INSERT policy. Inserts are revoked from `anon` and `authenticated`; validated guest writes are performed only by Express. Profile insert/delete and prompt mutation privileges are also revoked from browser roles.

## Seed data

`supabase/seed.sql` inserts five clearly non-personal development prompts. The unique prompt text constraint plus `ON CONFLICT DO NOTHING` makes repeated local resets safe. No fake users or memories are seeded.
