import { describe, expect, it, vi } from 'vitest';
import { getOwnedExportBook } from './export.service.js';

function query(result) {
  const chain = {};
  for (const method of ['select', 'eq', 'order']) {
    chain[method] = vi.fn(() => chain);
  }
  chain.single = vi.fn(async () => result);
  chain.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}

describe('memory book export service', () => {
  it('queries only the authenticated owner visible memories and strips internal fields', async () => {
    const profileQuery = query({
      data: {
        display_name: 'Khin',
        username: 'khin',
        memory_book_mode: 'standard',
      },
      error: null,
    });
    const promptQuery = query({
      data: [{ id: 'prompt-1', text: 'What will you remember?' }],
      error: null,
    });
    const memoryQuery = query({
      data: [
        {
          author_name: 'May',
          message: 'The library afternoons.',
          is_anonymous: false,
          prompt_id: 'prompt-1',
          photo_path: null,
          created_at: '2026-09-24T00:00:00Z',
        },
      ],
      error: null,
    });
    const queries = [profileQuery, promptQuery, memoryQuery];
    const database = { from: vi.fn(() => queries.shift()) };

    const result = await getOwnedExportBook('owner-1', database, {});

    expect(profileQuery.eq).toHaveBeenCalledWith('id', 'owner-1');
    expect(memoryQuery.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
    expect(memoryQuery.eq).toHaveBeenCalledWith('is_hidden', false);
    expect(result.memories).toEqual([
      {
        author_name: 'May',
        message: 'The library afternoons.',
        is_anonymous: false,
        created_at: '2026-09-24T00:00:00Z',
        prompt: 'What will you remember?',
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('photo_path');
    expect(JSON.stringify(result)).not.toContain('prompt_id');
  });

  it('keeps text memories available when photo signing fails', async () => {
    const queries = [
      query({ data: { display_name: 'Khin' }, error: null }),
      query({ data: [], error: null }),
      query({
        data: [
          {
            author_name: null,
            message: 'Still readable',
            is_anonymous: true,
            prompt_id: null,
            photo_path: 'owner-1/memory/photo.jpg',
            created_at: '2026-09-24T00:00:00Z',
          },
        ],
        error: null,
      }),
    ];
    const storage = {
      from: vi.fn(() => ({
        createSignedUrls: vi.fn(async () => ({ error: new Error('down') })),
      })),
    };

    const result = await getOwnedExportBook(
      'owner-1',
      { from: vi.fn(() => queries.shift()) },
      storage,
    );

    expect(result.memories[0].message).toBe('Still readable');
    expect(result.memories[0]).not.toHaveProperty('photo_path');
    expect(result.memories[0]).not.toHaveProperty('photo_url');
  });
});
