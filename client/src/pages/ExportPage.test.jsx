import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExportPage from './ExportPage.jsx';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getExportBook: vi.fn(),
}));

vi.mock('../auth/auth-context.js', () => ({ useAuth: mocks.useAuth }));
vi.mock('../services/dashboardService.js', () => ({
  dashboardService: { getExportBook: mocks.getExportBook },
}));

const standardBook = {
  profile: {
    display_name: 'Khin',
    username: 'khin',
    bio: 'Keep the small moments close.',
    avatar_url: null,
    memory_book_mode: 'standard',
  },
  memories: [
    {
      author_name: 'May',
      message: 'The library afternoons.',
      is_anonymous: false,
      prompt: 'What will you remember?',
      photo_url: 'https://storage.test/signed-photo',
      created_at: '2026-09-24T00:00:00Z',
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useAuth.mockReturnValue({ session: { access_token: 'owner-token' } });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ExportPage />
    </MemoryRouter>,
  );
}

describe('memory book export preview', () => {
  it('renders the cover, prompt, photo, and print control', async () => {
    mocks.getExportBook.mockResolvedValue(standardBook);
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderPage();

    expect(
      await screen.findByRole('heading', { name: "Khin's Memory Book" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The library afternoons.', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(/What will you remember/)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(
      "Photo attached to May's memory",
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Attached photo unavailable.',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Print / Save as PDF' }),
    );
    expect(print).toHaveBeenCalledOnce();
  });

  it('uses configured graduation details on the keepsake cover', async () => {
    mocks.getExportBook.mockResolvedValue({
      profile: {
        ...standardBook.profile,
        memory_book_mode: 'graduation',
        graduation_title: 'Final Year Farewell',
        graduation_class: 'Class A',
        graduation_year: 2027,
        graduation_message: 'To the next chapter.',
      },
      memories: [],
    });
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Final Year Farewell' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Class A · 2027')).toBeInTheDocument();
    expect(screen.getByText('To the next chapter.')).toBeInTheDocument();
  });

  it('shows a meaningful empty state', async () => {
    mocks.getExportBook.mockResolvedValue({
      ...standardBook,
      memories: [],
    });
    renderPage();

    expect(
      await screen.findByRole('heading', {
        name: 'Your memory book is still waiting for its first memory.',
      }),
    ).toBeInTheDocument();
  });
});
