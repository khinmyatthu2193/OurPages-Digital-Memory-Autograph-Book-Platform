import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardContext } from '../components/dashboard/dashboard-context.js';
import MemoriesPage from './MemoriesPage.jsx';

const memories = [
  {
    id: '1',
    author_name: 'May',
    message: 'Our library afternoon',
    is_anonymous: false,
    is_favorite: true,
    is_pinned: false,
    is_hidden: false,
    created_at: '2026-09-20T00:00:00Z',
  },
  {
    id: '2',
    author_name: null,
    message: 'Graduation day',
    is_anonymous: true,
    is_favorite: false,
    is_pinned: true,
    is_hidden: true,
    created_at: '2026-09-19T00:00:00Z',
  },
];

function renderPage(overrides = {}) {
  const value = {
    profile: { username: 'khin' },
    memories,
    updateMemory: vi.fn().mockResolvedValue({}),
    deleteMemory: vi.fn().mockResolvedValue(),
    ...overrides,
  };
  render(
    <DashboardContext.Provider value={value}>
      <MemoriesPage />
    </DashboardContext.Provider>,
  );
  return value;
}

describe('memory management page', () => {
  it('searches and filters owned memories', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Search your memories...'), {
      target: { value: 'library' },
    });
    expect(screen.getByText(/Our library afternoon/)).toBeInTheDocument();
    expect(screen.queryByText(/Graduation day/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search your memories...'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hidden' }));
    expect(screen.getByText(/Graduation day/)).toBeInTheDocument();
    expect(screen.queryByText(/Our library afternoon/)).not.toBeInTheDocument();
  });

  it('sends owner actions through the mutation service', async () => {
    const value = renderPage();
    const card = within(screen.getByText(/Graduation day/).closest('article'));
    fireEvent.click(card.getByRole('button', { name: 'Favorite' }));
    await waitFor(() =>
      expect(value.updateMemory).toHaveBeenCalledWith('2', {
        is_favorite: true,
      }),
    );
    await waitFor(() =>
      expect(card.getByRole('button', { name: 'Delete' })).toBeEnabled(),
    );
    fireEvent.click(card.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'cannot be undone',
    );
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      }),
    );
    expect(value.deleteMemory).toHaveBeenCalledWith('2');
  });

  it('shows the share empty state without fake memories', () => {
    renderPage({ memories: [] });
    expect(
      screen.getByRole('heading', { name: 'No memories yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy link' }),
    ).toBeInTheDocument();
  });
});
