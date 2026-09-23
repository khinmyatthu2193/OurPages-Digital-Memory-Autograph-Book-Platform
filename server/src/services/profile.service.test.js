import { describe, expect, it, vi } from 'vitest';
import { updateCurrentProfile } from './profile.service.js';

function query(result) {
  const chain = {};
  for (const method of ['update', 'eq', 'select'])
    chain[method] = vi.fn(() => chain);
  chain.single = vi.fn(async () => result);
  return chain;
}

describe('owner profile service', () => {
  it('updates only the authenticated owner profile', async () => {
    const chain = query({
      data: { id: 'owner-1', display_name: 'Khin' },
      error: null,
    });
    const result = await updateCurrentProfile(
      'owner-1',
      { display_name: ' Khin ' },
      { from: vi.fn(() => chain) },
    );
    expect(result.display_name).toBe('Khin');
    expect(chain.update).toHaveBeenCalledWith({ display_name: 'Khin' });
    expect(chain.eq).toHaveBeenCalledWith('id', 'owner-1');
  });

  it('allows open and closed book states', async () => {
    for (const status of ['open', 'closed']) {
      const chain = query({
        data: { memory_book_status: status },
        error: null,
      });
      await updateCurrentProfile(
        'owner-1',
        { memory_book_status: status },
        { from: vi.fn(() => chain) },
      );
      expect(chain.update).toHaveBeenCalledWith({ memory_book_status: status });
    }
  });

  it('rejects unsupported profile fields', async () => {
    await expect(
      updateCurrentProfile('owner-1', { username: 'changed' }, {}),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('updates optional graduation mode details for the authenticated owner', async () => {
    const chain = query({
      data: { memory_book_mode: 'graduation' },
      error: null,
    });
    await updateCurrentProfile(
      'owner-1',
      {
        memory_book_mode: 'graduation',
        graduation_title: ' Final Year Farewell ',
        graduation_class: ' Class A ',
        graduation_year: 2026,
        graduation_message: '',
      },
      { from: vi.fn(() => chain) },
    );
    expect(chain.update).toHaveBeenCalledWith({
      memory_book_mode: 'graduation',
      graduation_title: 'Final Year Farewell',
      graduation_class: 'Class A',
      graduation_year: 2026,
      graduation_message: null,
    });
    expect(chain.eq).toHaveBeenCalledWith('id', 'owner-1');
  });

  it('allows returning to standard mode and rejects invalid graduation data', async () => {
    const chain = query({
      data: { memory_book_mode: 'standard' },
      error: null,
    });
    await updateCurrentProfile(
      'owner-1',
      { memory_book_mode: 'standard' },
      { from: vi.fn(() => chain) },
    );
    expect(chain.update).toHaveBeenCalledWith({ memory_book_mode: 'standard' });

    await expect(
      updateCurrentProfile(
        'owner-1',
        { graduation_year: 1800 },
        { from: vi.fn(() => chain) },
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    await expect(
      updateCurrentProfile(
        'owner-1',
        { memory_book_mode: 'party' },
        { from: vi.fn(() => chain) },
      ),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });
});
