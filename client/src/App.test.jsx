import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

describe('application routes', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['/', 'Memories worth keeping.'],
    ['/login', 'Log in'],
    ['/register', 'Create your memory book'],
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
      await screen.findByText('This memory book is currently closed.'),
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

  it('renders graduation mode with farewell copy and prioritized prompts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            profile: {
              display_name: 'Khin',
              username: 'khin',
              bio: 'A personal bio',
              avatar_url: null,
              memory_book_status: 'open',
              memory_book_mode: 'graduation',
              graduation_title: 'Final Year Farewell',
              graduation_class: 'Class A',
              graduation_year: 2026,
              graduation_message: 'Thank you for being part of this chapter.',
            },
            prompts: [
              { id: 'general', text: 'A general prompt', category: 'memory' },
              {
                id: 'farewell',
                text: 'What will you miss?',
                category: 'graduation',
              },
            ],
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
      await screen.findByRole('heading', { name: 'Final Year Farewell' }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Khin's Farewell Memory Book | OurPages");
    fireEvent.click(
      screen.getByRole('button', { name: 'Leave a Farewell Memory' }),
    );
    expect(screen.getAllByRole('radio')[1]).toHaveAccessibleName(
      'What will you miss?',
    );
    fireEvent.click(screen.getByLabelText('Post anonymously'));
    fireEvent.change(screen.getByLabelText('Your memory'), {
      target: { value: 'Until our next chapter.' },
    });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(
      await screen.findByRole('heading', {
        name: 'Your farewell memory has been added.',
      }),
    ).toBeInTheDocument();
  });

  it('treats private books like missing books without exposing memories', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { code: 'BOOK_NOT_FOUND', message: 'Memory book not found' },
        }),
      }),
    );
    render(
      <MemoryRouter initialEntries={['/u/private-owner']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', {
        name: "This OurPages page doesn't exist.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/memories collected/i)).not.toBeInTheDocument();
  });
});
