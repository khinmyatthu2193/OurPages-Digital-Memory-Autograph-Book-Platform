import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const migrationPath = fileURLToPath(
  new URL(
    '../../supabase/migrations/202609150001_phase_2_foundation.sql',
    import.meta.url,
  ),
);
const sql = readFileSync(migrationPath, 'utf8');
const publicProfileSql = readFileSync(
  fileURLToPath(
    new URL(
      '../../supabase/migrations/202609220001_public_profile_columns.sql',
      import.meta.url,
    ),
  ),
  'utf8',
);

describe('database authorization migration', () => {
  it.each(['profiles', 'prompts', 'memories'])('enables RLS on %s', (table) => {
    expect(sql).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it('scopes memory operations to the authenticated owner', () => {
    expect(sql.match(/auth\.uid\(\) = owner_id/g)).toHaveLength(4);
  });

  it('does not create a public memory insert policy', () => {
    expect(sql).toContain(
      'revoke insert on table public.memories from anon, authenticated',
    );
    expect(sql).not.toMatch(/create policy[^;]+memories for insert/is);
  });

  it('ties profile IDs to Auth users and memory owners to profiles', () => {
    expect(sql).toContain(
      'id uuid primary key references auth.users(id) on delete cascade',
    );
    expect(sql).toContain(
      'owner_id uuid not null references public.profiles(id) on delete cascade',
    );
  });

  it('enforces duplicate usernames at the database boundary', () => {
    expect(sql).toContain(
      'constraint profiles_username_unique unique (username)',
    );
  });

  it('does not grant anonymous access to the profile Auth user ID', () => {
    expect(publicProfileSql).toContain(
      'revoke select on table public.profiles from anon',
    );
    expect(publicProfileSql).toContain(
      'grant select (display_name, username, bio, avatar_url, memory_book_status)',
    );
    expect(publicProfileSql).not.toMatch(/grant select \([^)]*\bid\b/);
  });
});
