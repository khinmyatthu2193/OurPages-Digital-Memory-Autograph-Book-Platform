import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/auth-context.js';
import { dashboardService } from '../../services/dashboardService.js';
import { DashboardContext } from './dashboard-context.js';

const navigation = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/memories', label: 'Memories' },
  { to: '/dashboard/my-page', label: 'My Page' },
  { to: '/dashboard/export', label: 'Export' },
  { to: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardLayout() {
  const { session, user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = session?.access_token;

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [identity, ownedMemories] = await Promise.all([
        dashboardService.getIdentity(token),
        dashboardService.getMemories(token),
      ]);
      setProfile(identity.profile);
      setMemories(ownedMemories);
    } catch (loadError) {
      setError(loadError.message || "We couldn't load your memory book.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    Promise.all([
      dashboardService.getIdentity(token),
      dashboardService.getMemories(token),
    ])
      .then(([identity, ownedMemories]) => {
        if (!active) return;
        setProfile(identity.profile);
        setMemories(ownedMemories);
      })
      .catch((loadError) => {
        if (active)
          setError(loadError.message || "We couldn't load your memory book.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      profile,
      memories,
      async updateMemory(id, updates) {
        const previous = memories;
        setMemories((items) =>
          items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        );
        try {
          const updated = await dashboardService.updateMemory(
            token,
            id,
            updates,
          );
          setMemories((items) =>
            items.map((item) => (item.id === id ? updated : item)),
          );
          return updated;
        } catch (mutationError) {
          setMemories(previous);
          throw mutationError;
        }
      },
      async deleteMemory(id) {
        await dashboardService.deleteMemory(token, id);
        setMemories((items) => items.filter((item) => item.id !== id));
      },
      async updateProfile(updates) {
        const updated = await dashboardService.updateProfile(token, updates);
        setProfile(updated);
        return updated;
      },
      reload: loadDashboard,
    }),
    [profile, memories, token, loadDashboard],
  );

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink className="dashboard-brand" to="/dashboard">
          <span aria-hidden="true">✳</span> OurPages
        </NavLink>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              end={item.end}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-identity">
          <span className="dashboard-avatar" aria-hidden="true">
            {profile?.display_name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>{profile?.display_name || 'Your book'}</strong>
            <small>{user?.email}</small>
          </div>
        </div>
        <button
          className="dashboard-logout"
          type="button"
          onClick={() => logout()}
        >
          Log out
        </button>
      </aside>
      <div className="dashboard-body">
        <header className="dashboard-mobile-header">
          <NavLink className="dashboard-brand" to="/dashboard">
            <span aria-hidden="true">✳</span> OurPages
          </NavLink>
          <button type="button" onClick={() => logout()}>
            Log out
          </button>
        </header>
        <nav className="dashboard-mobile-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              end={item.end}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="dashboard-main">
          {loading ? (
            <div className="dashboard-state" role="status">
              <span className="dashboard-loader" />
              Loading your memories...
            </div>
          ) : error ? (
            <div className="dashboard-state" role="alert">
              <h1>We couldn&apos;t load your memory book.</h1>
              <p>{error}</p>
              <button
                className="dashboard-button primary"
                type="button"
                onClick={loadDashboard}
              >
                Try again
              </button>
            </div>
          ) : (
            <DashboardContext.Provider value={value}>
              <Outlet />
            </DashboardContext.Provider>
          )}
        </main>
      </div>
    </div>
  );
}
