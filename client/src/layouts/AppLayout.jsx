import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="site-header">
        <nav aria-label="Primary navigation" className="site-nav">
          <Link className="site-logo" to="/">
            <span className="site-logo-mark" aria-hidden="true">
              ✳
            </span>{' '}
            OurPages
          </Link>
          <div className="site-nav-actions">
            <Link className="site-login" to="/login">
              Log in
            </Link>
            <Link className="site-register" to="/register">
              Get started <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
