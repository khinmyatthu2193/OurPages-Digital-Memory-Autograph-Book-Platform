import { describe, expect, it, vi } from 'vitest';
import {
  deleteOwnedMemory,
  listOwnedMemories,
  updateOwnedMemory,
} from './owner-memory.service.js';

const memoryId = '11111111-1111-4111-8111-111111111111';

function query(result) {
  const chain = {};
  for (const method of ['select', 'eq', 'order', 'update', 'delete']) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = vi.fn(async () => result);
  chain.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}

describe('owner memory service', () => {
  it('lists only the authenticated owner memories with pinned-first ordering', async () => {
    const chain = query({ data: [{ id: memoryId }], error: null });
    const database = { from: vi.fn(() => chain) };
    const result = await listOwnedMemories('owner-1', database);
    expect(result).toHaveLength(1);
    expect(chain.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
    expect(chain.order).toHaveBeenNthCalledWith(1, 'is_pinned', {
      ascending: false,
    });
    expect(chain.order).toHaveBeenNthCalledWith(2, 'created_at', {
      ascending: false,
    });
  });

  it.each([
    ['is_favorite', true],
    ['is_favorite', false],
    ['is_pinned', true],
    ['is_pinned', false],
    ['is_hidden', true],
    ['is_hidden', false],
  ])('updates owned %s to %s', async (field, value) => {
    const chain = query({
      data: { id: memoryId, [field]: value },
      error: null,
    });
    const result = await updateOwnedMemory(
      'owner-1',
      memoryId,
      { [field]: value },
      { from: vi.fn(() => chain) },
    );
    expect(result[field]).toBe(value);
    expect(chain.update).toHaveBeenCalledWith({ [field]: value });
    expect(chain.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
  });

  it('rejects owner-controlled IDs and malformed mutations', async () => {
    await expect(
      updateOwnedMemory('owner-1', memoryId, { owner_id: 'owner-2' }, {}),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('does not expose another owner memory through update', async () => {
    const chain = query({ data: null, error: null });
    await expect(
      updateOwnedMemory(
        'owner-1',
        memoryId,
        { is_hidden: true },
        { from: vi.fn(() => chain) },
      ),
    ).rejects.toMatchObject({ status: 404, code: 'MEMORY_NOT_FOUND' });
    expect(chain.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
  });

  it('deletes only a memory belonging to the authenticated owner', async () => {
    const chain = query({ data: { id: memoryId }, error: null });
    await expect(
      deleteOwnedMemory('owner-1', memoryId, { from: vi.fn(() => chain) }),
    ).resolves.toEqual({ id: memoryId, photo_cleanup_failed: false });
    expect(chain.delete).toHaveBeenCalledOnce();
    expect(chain.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
  });

  it('does not delete another owner memory', async () => {
    const chain = query({ data: null, error: null });
    await expect(
      deleteOwnedMemory('owner-1', memoryId, { from: vi.fn(() => chain) }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('cleans up the private photo after deleting its memory', async () => {
    const path = `owner-1/${memoryId}/photo.jpg`;
    const chain = query({
      data: { id: memoryId, photo_path: path },
      error: null,
    });
    const remove = vi.fn(async () => ({ error: null }));
    const storage = { from: vi.fn(() => ({ remove })) };
    await expect(
      deleteOwnedMemory(
        'owner-1',
        memoryId,
        { from: vi.fn(() => chain) },
        storage,
      ),
    ).resolves.toEqual({ id: memoryId, photo_cleanup_failed: false });
    expect(remove).toHaveBeenCalledWith([path]);
  });
});
