import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

describe('application routes', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['/', 'Memories worth keeping.'],
    ['/login', 'Log in'],
    ['/register', 'Register'],
    ['/u/khin', "Khin's OurPages"],
  ])('renders %s', async (path, heading) => {
    if (path === '/u/khin') {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            data: {
              profile: {
                display_name: 'Khin',
                username: 'khin',
                bio: null,
                avatar_url: null,
                memory_book_status: 'open',
              },
              prompts: [],
              memories: [],
            },
          }),
        }),
      );
    }
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument();
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

  it('shows a retry message when the public API is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { code: 'SERVER_NOT_CONFIGURED', message: 'Unavailable' },
        }),
      }),
    );
    render(
      <MemoryRouter initialEntries={['/u/khin']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', {
        name: 'This page could not be loaded.',
      }),
    ).toBeInTheDocument();
  });

  it('does not offer submission for a closed book', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            profile: {
              display_name: 'Khin',
              username: 'khin',
              bio: null,
              avatar_url: null,
              memory_book_status: 'closed',
            },
            prompts: [],
            memories: [],
          },
        }),
      }),
    );
    render(
      <MemoryRouter initialEntries={['/u/khin']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByText(
        'This memory book is currently closed to new messages.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Leave a Memory' }),
    ).not.toBeInTheDocument();
  });

  it('confirms a guest submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              profile: {
                display_name: 'Khin',
                username: 'khin',
                bio: null,
                avatar_url: null,
                memory_book_status: 'open',
              },
              prompts: [],
              memories: [],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { id: 'memory-1' } }),
        }),
    );
    render(
      <MemoryRouter initialEntries={['/u/khin']}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Leave a Memory' }),
    );
    fireEvent.click(screen.getByLabelText('Post anonymously'));
    fireEvent.change(screen.getByLabelText('Your memory'), {
      target: { value: 'A lovely day' },
    });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(
      await screen.findByRole('heading', {
        name: 'Your memory has been added.',
      }),
    ).toBeInTheDocument();
  });
});
