import { Link } from 'react-router-dom';
import BookStatusCard from '../components/dashboard/BookStatusCard.jsx';
import OwnerMemoryCard from '../components/dashboard/OwnerMemoryCard.jsx';
import ShareLinkCard from '../components/dashboard/ShareLinkCard.jsx';
import { useDashboard } from '../components/dashboard/dashboard-context.js';

export default function DashboardPage() {
  const { profile, memories, updateProfile } = useDashboard();
  const stats = [
    ['Total memories', memories.length],
    ['Favorites', memories.filter((memory) => memory.is_favorite).length],
    ['Pinned', memories.filter((memory) => memory.is_pinned).length],
    ['Hidden', memories.filter((memory) => memory.is_hidden).length],
  ];
  const recent = memories.slice(0, 3);

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-heading">
        <p className="dashboard-eyebrow">Your collection</p>
        <h1>Welcome back, {profile.display_name}.</h1>
        <p>Here are the memories your people have left for you.</p>
      </header>
      <section className="stats-grid" aria-label="Memory statistics">
        {stats.map(([label, count]) => (
          <div className="stat-card" key={label}>
            <strong>{count}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>
      <div className="dashboard-overview-grid">
        <ShareLinkCard
          username={profile.username}
          displayName={profile.display_name}
          mode={profile.memory_book_mode}
        />
        <BookStatusCard
          status={profile.memory_book_status}
          onChange={(status) => updateProfile({ memory_book_status: status })}
        />
      </div>
      <section
        className="dashboard-card export-callout"
        aria-labelledby="export-title"
      >
        <div>
          <p className="dashboard-eyebrow">Preserve your pages</p>
          <h2 id="export-title">Export My Memory Book</h2>
          <p>Save your visible memories as a printable memory book.</p>
        </div>
        <Link className="dashboard-button primary" to="/dashboard/export">
          Preview memory book
        </Link>
      </section>
      <section className="recent-section" aria-labelledby="recent-title">
        <div className="section-title-row">
          <div>
            <p className="dashboard-eyebrow">Fresh from the page</p>
            <h2 id="recent-title">Recent memories</h2>
          </div>
          <Link to="/dashboard/memories">View all</Link>
        </div>
        {recent.length ? (
          <div className="recent-list">
            {recent.map((memory) => (
              <OwnerMemoryCard key={memory.id} memory={memory} condensed />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <span aria-hidden="true">♡</span>
            <h3>No memories yet</h3>
            <p>
              Share your personal page and messages from your friends will
              appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
