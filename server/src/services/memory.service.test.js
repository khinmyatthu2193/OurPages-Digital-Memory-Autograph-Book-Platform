import { describe, expect, it, vi } from 'vitest';
import { createPublicMemory, getPublicBook } from './memory.service.js';

function query(result) {
  const chain = {};
  for (const method of ['select', 'eq', 'neq', 'order', 'insert'])
    chain[method] = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(async () => result);
  chain.single = vi.fn(async () => result);
  chain.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);
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

  it('uploads a validated photo to a server-controlled path', async () => {
    const ownerQuery = query({ data: { id: 'owner-1' }, error: null });
    const insertQuery = query({
      data: { id: 'memory-1', created_at: '2026-09-25' },
      error: null,
    });
    const database = {
      from: vi.fn((table) => (table === 'profiles' ? ownerQuery : insertQuery)),
    };
    const upload = vi.fn(async () => ({ error: null }));
    const storage = { from: vi.fn(() => ({ upload })) };
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);

    await createPublicMemory(
      'khin',
      { authorName: 'May', message: 'Photo memory' },
      database,
      { mimetype: 'image/jpeg', size: buffer.length, buffer },
      storage,
    );

    const [path] = upload.mock.calls[0];
    expect(path).toMatch(/^owner-1\/[0-9a-f-]+\/[0-9a-f-]+\.jpg$/);
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: 'owner-1', photo_path: path }),
    );
  });

  it('removes an uploaded photo when the memory insert fails', async () => {
    const ownerQuery = query({ data: { id: 'owner-1' }, error: null });
    const insertQuery = query({ data: null, error: { code: 'DB_ERROR' } });
    const database = {
      from: vi.fn((table) => (table === 'profiles' ? ownerQuery : insertQuery)),
    };
    const remove = vi.fn(async () => ({ error: null }));
    const storage = {
      from: vi.fn(() => ({
        upload: vi.fn(async () => ({ error: null })),
        remove,
      })),
    };
    const buffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    await expect(
      createPublicMemory(
        'khin',
        { authorName: 'May', message: 'Photo memory' },
        database,
        { mimetype: 'image/png', size: buffer.length, buffer },
        storage,
      ),
    ).rejects.toMatchObject({ code: 'DATABASE_ERROR' });
    expect(remove).toHaveBeenCalledWith([expect.stringMatching(/\.png$/)]);
  });

  it('does not create a memory when photo upload fails', async () => {
    const ownerQuery = query({ data: { id: 'owner-1' }, error: null });
    const database = { from: vi.fn(() => ownerQuery) };
    const storage = {
      from: vi.fn(() => ({
        upload: vi.fn(async () => ({ error: { message: 'storage down' } })),
      })),
    };
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);

    await expect(
      createPublicMemory(
        'khin',
        { message: 'Anonymous photo', isAnonymous: true },
        database,
        { mimetype: 'image/jpeg', size: buffer.length, buffer },
        storage,
      ),
    ).rejects.toMatchObject({ code: 'PHOTO_UPLOAD_FAILED', status: 502 });
    expect(database.from).toHaveBeenCalledTimes(1);
  });

  it('returns the existing memory for an idempotent retry', async () => {
    const ownerQuery = query({ data: { id: 'owner-1' }, error: null });
    const insertQuery = query({ data: null, error: { code: '23505' } });
    const existingQuery = query({
      data: { id: 'memory-existing', created_at: '2026-09-25' },
      error: null,
    });
    const memoryQueries = [insertQuery, existingQuery];
    const database = {
      from: vi.fn((table) =>
        table === 'profiles' ? ownerQuery : memoryQueries.shift(),
      ),
    };

    await expect(
      createPublicMemory(
        'khin',
        {
          authorName: 'May',
          message: 'Only save this once',
          submissionId: '11111111-1111-4111-8111-111111111111',
        },
        database,
      ),
    ).resolves.toEqual({
      id: 'memory-existing',
      created_at: '2026-09-25',
    });
    expect(existingQuery.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
  });

  it('queries memories with an explicit hidden-memory exclusion', async () => {
    const profileQuery = query({
      data: { id: 'owner-1', username: 'khin' },
      error: null,
    });
    const promptQuery = query({ data: [], error: null });
    const memoryQuery = query({ data: [], error: null });
    const queries = [profileQuery, promptQuery, memoryQuery];
    const database = { from: vi.fn(() => queries.shift()) };

    const book = await getPublicBook('khin', database);

    expect(book.memories).toEqual([]);
    expect(book.profile).toEqual({ username: 'khin' });
    expect(memoryQuery.eq).toHaveBeenCalledWith('is_hidden', false);
    expect(memoryQuery.select).toHaveBeenCalledWith(
      'id, author_name, message, is_anonymous, prompt_id, photo_path, created_at',
    );
    expect(profileQuery.select).toHaveBeenCalledWith(
      expect.stringContaining('memory_book_mode'),
    );
    expect(profileQuery.select).toHaveBeenCalledWith(
      expect.not.stringContaining('email'),
    );
  });
});
