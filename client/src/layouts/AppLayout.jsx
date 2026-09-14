import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-rose-200/70 bg-white/60">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4"
        >
          <Link className="text-lg font-semibold no-underline" to="/">
            OurPages
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-12">
        <Outlet />
      </main>
    </div>
  );
}
