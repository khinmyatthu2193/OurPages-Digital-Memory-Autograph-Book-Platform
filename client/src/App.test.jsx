import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

describe('application routes', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['/', 'Memories worth keeping'],
    ['/login', 'Log in'],
    ['/register', 'Register'],
    ['/u/khin', "Khin's OurPages"],
  ])('renders %s', async (path, heading) => {
    if (path === '/u/khin') {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { profile: { display_name: 'Khin', username: 'khin', bio: null, avatar_url: null, memory_book_status: 'open' }, prompts: [], memories: [] } }) }));
    }
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('redirects unauthenticated dashboard visitors to login', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Log in' }),
    ).toBeInTheDocument();
  });
});
