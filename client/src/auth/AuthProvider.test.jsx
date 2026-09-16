import { act, renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { describe, expect, it, vi } from 'vitest';
import AuthProvider from './AuthProvider.jsx';
import { useAuth } from './auth-context.js';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(async () => ({ data: { session: null } })),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../lib/supabase.js', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: mocks },
}));

function Wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

Wrapper.propTypes = { children: PropTypes.node.isRequired };

describe('Supabase authentication provider', () => {
  async function setup() {
    const hook = renderHook(() => useAuth(), { wrapper: Wrapper });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    return hook.result;
  }

  it('registers with profile metadata', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    const result = await setup();
    await act(() =>
      result.current.register({
        email: 'khin@example.com',
        password: 'password1',
        displayName: 'Khin',
        username: 'khin',
      }),
    );
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'khin@example.com',
        options: { data: { display_name: 'Khin', username: 'khin' } },
      }),
    );
  });

  it('logs in with valid credentials', async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: { session: {} },
      error: null,
    });
    const result = await setup();
    await expect(
      result.current.login({
        email: 'khin@example.com',
        password: 'password1',
      }),
    ).resolves.toEqual({ session: {} });
  });

  it('surfaces invalid credential errors', async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: new Error('Invalid login credentials'),
    });
    const result = await setup();
    await expect(
      result.current.login({ email: 'khin@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid login credentials');
  });

  it('logs out through Supabase Auth', async () => {
    mocks.signOut.mockResolvedValueOnce({ error: null });
    const result = await setup();
    await act(() => result.current.logout());
    expect(mocks.signOut).toHaveBeenCalled();
  });

  it('subscribes to persisted session changes', async () => {
    await setup();
    await waitFor(() => expect(mocks.getSession).toHaveBeenCalled());
    expect(mocks.onAuthStateChange).toHaveBeenCalled();
  });
});
