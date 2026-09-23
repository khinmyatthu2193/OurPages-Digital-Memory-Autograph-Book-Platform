# Database Design

The source of truth is the ordered `supabase/migrations/` set, including the Phase 3 public-memory limit migration. Supabase PostgreSQL is accessed through `@supabase/supabase-js`; the earlier standalone Prisma user/password model has been removed.

## Relationships

```text
auth.users 1 ── 1 profiles 1 ── * memories * ── 0..1 prompts
```

Deleting an Auth user cascades to the profile and owned memories. Deleting a prompt sets `memories.prompt_id` to null.

## Tables

`profiles` contains the Auth UUID primary/foreign key, display name, unique normalized username, optional bio/avatar URL, `open | closed | private` book status, `standard | graduation` book mode, optional graduation title/class/year/message fields, and timestamps. Existing and new profiles default to standard mode. It contains no email, password, or credential fields. Usernames are 3–30 lowercase URL-safe characters, must begin with a letter/number, and cannot use the maintained reserved list in the migration and validators.

`memories` contains a UUID, required owner, optional author name for anonymous submissions, message, anonymity flag, optional prompt, nullable private `photo_path`, nullable idempotency `submission_token`, owner moderation flags, and timestamps. Phase 3 constrains messages to 1–2,000 nonblank characters and requires an author name for non-anonymous messages. The API never exposes `photo_path`; it returns a short-lived `photo_url` only after authorization.

Phase 4 uses the existing `is_favorite`, `is_pinned`, and `is_hidden` columns for owner management. It introduces no new tables or moderation relationships. Owner queries order pinned memories first and newest memories within each group.

`prompts` contains a UUID, unique prompt text, category, active flag, and timestamps. Allowed categories are `memory`, `friendship`, `graduation`, `future`, and `fun`. Phase 6 adds a small general-purpose graduation/farewell prompt set without removing standard prompts.

All three tables use triggers to maintain `updated_at`. Registration uses a security-definer trigger with an empty search path to create exactly one profile for each new Auth user.

Phase 5 is a client experience and documentation release. It adds no schema, migration, privilege, or RLS changes.

Phase 6 adds the `memory_book_mode` enum and four nullable graduation display columns to `profiles`. The existing owner-update RLS policy covers them; no new write policy is added. Anonymous column grants are explicitly refreshed to include only the new public display fields and continue to exclude the profile/Auth ID.

Phase 7 renames the unused `photo_url` column to `photo_path`, preserving null values for existing text memories, and adds a partial unique index on non-null submission tokens. It also creates the private `memory-photos` Storage bucket with a 5 MB object limit and a JPEG/PNG/WebP MIME allow-list. No browser-role `storage.objects` policy is created.

## Indexes

- Unique profile username index/constraint
- Unique prompt text constraint (also makes seeding repeatable)
- `(owner_id, created_at desc)` for owner inbox ordering
- `(owner_id, is_hidden, created_at desc)` for visibility filtering
- `prompt_id` for memory/prompt joins
- `(is_active, category)` for prompt selection
- Unique non-null `(owner_id, submission_token)` for idempotent guest retries

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

Anonymous profile reads have column-level grants for public display fields only. The Auth user UUID remains available to the owner/server workflow but is not readable through the anonymous table role or public-book API.

## Seed data

`supabase/seed.sql` inserts clearly non-personal standard and graduation/farewell prompts. The production Phase 6 migration also inserts the new graduation prompts. The unique prompt text constraint plus `ON CONFLICT DO NOTHING` makes repeated application safe. No fake users or memories are seeded.
