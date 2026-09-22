import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardLayout from './DashboardLayout.jsx';
import DashboardPage from '../../pages/DashboardPage.jsx';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getIdentity: vi.fn(),
  getMemories: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('../../auth/auth-context.js', () => ({ useAuth: mocks.useAuth }));
vi.mock('../../services/dashboardService.js', () => ({
  dashboardService: {
    getIdentity: mocks.getIdentity,
    getMemories: mocks.getMemories,
    updateProfile: mocks.updateProfile,
    updateMemory: vi.fn(),
    deleteMemory: vi.fn(),
  },
}));

const profile = {
  display_name: 'Khin',
  username: 'khin',
  bio: '',
  avatar_url: null,
  memory_book_status: 'open',
};
const memories = [
  {
    id: '1',
    author_name: 'May',
    message: 'Hello',
    is_anonymous: false,
    is_favorite: true,
    is_pinned: true,
    is_hidden: false,
    created_at: '2026-09-20T00:00:00Z',
  },
  {
    id: '2',
    author_name: null,
    message: 'Secret',
    is_anonymous: true,
    is_favorite: false,
    is_pinned: false,
    is_hidden: true,
    created_at: '2026-09-19T00:00:00Z',
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useAuth.mockReturnValue({
    session: { access_token: 'token' },
    user: { email: 'khin@example.test' },
    logout: vi.fn(),
  });
});

describe('owner dashboard overview', () => {
  it('shows a loading state while owner data is requested', () => {
    mocks.getIdentity.mockReturnValue(new Promise(() => {}));
    mocks.getMemories.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your memories',
    );
  });

  it('renders real owner statistics and recent memories', async () => {
    mocks.getIdentity.mockResolvedValue({ profile });
    mocks.getMemories.mockResolvedValue(memories);
    renderDashboard();
    expect(
      await screen.findByRole('heading', { name: 'Welcome back, Khin.' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByText('Total memories').parentElement).getByText('2'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByText('Favorites').parentElement).getByText('1'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Secret/)).toBeInTheDocument();
  });

  it('shows an error and supports retrying', async () => {
    mocks.getIdentity.mockRejectedValueOnce(new Error('Network unavailable'));
    mocks.getMemories.mockResolvedValue([]);
    renderDashboard();
    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't load");
    mocks.getIdentity.mockResolvedValue({ profile });
    mocks.getMemories.mockResolvedValue([]);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Welcome back, Khin.' }),
      ).toBeInTheDocument(),
    );
  });
});
