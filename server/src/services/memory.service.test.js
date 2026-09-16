import { describe, expect, it, vi } from 'vitest';
import { createPublicMemory } from './memory.service.js';

function query(result) {
  const chain = {};
  for (const method of ['select', 'eq', 'neq', 'order', 'insert'])
    chain[method] = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(async () => result);
  chain.single = vi.fn(async () => result);
  return chain;
}

describe('public memory service', () => {
  it('associates a memory with the username-resolved owner', async () => {
    const ownerQuery = query({ data: { id: 'owner-1' }, error: null });
    const insertQuery = query({
      data: { id: 'memory-1', created_at: '2026-09-15' },
      error: null,
    });
    const database = {
      from: vi.fn((table) => (table === 'profiles' ? ownerQuery : insertQuery)),
    };

    const result = await createPublicMemory(
      'Khin',
      { authorName: 'May', message: 'Remember this!' },
      database,
    );

    expect(result.id).toBe('memory-1');
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: 'owner-1' }),
    );
  });

  it('rejects submission when the target book is not open', async () => {
    const database = { from: vi.fn(() => query({ data: null, error: null })) };
    await expect(
      createPublicMemory(
        'khin',
        { authorName: 'May', message: 'Hello' },
        database,
      ),
    ).rejects.toMatchObject({
      status: 404,
      code: 'BOOK_NOT_OPEN',
    });
  });
});
