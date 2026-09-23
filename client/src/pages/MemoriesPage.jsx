import { useMemo, useState } from 'react';
import OwnerMemoryCard from '../components/dashboard/OwnerMemoryCard.jsx';
import ShareLinkCard from '../components/dashboard/ShareLinkCard.jsx';
import { useDashboard } from '../components/dashboard/dashboard-context.js';

const filters = ['all', 'favorites', 'pinned', 'hidden'];

export default function MemoriesPage() {
  const { profile, memories, updateMemory, deleteMemory } = useDashboard();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const shown = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return memories
      .filter((memory) => {
        if (filter === 'favorites' && !memory.is_favorite) return false;
        if (filter === 'pinned' && !memory.is_pinned) return false;
        if (filter === 'hidden' && !memory.is_hidden) return false;
        if (!normalizedQuery) return true;
        return `${memory.author_name ?? ''} ${memory.message}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        const difference = new Date(b.created_at) - new Date(a.created_at);
        return sort === 'newest' ? difference : -difference;
      });
  }, [memories, query, filter, sort]);

  const emptyMessage =
    memories.length === 0
      ? 'No memories yet'
      : query
        ? 'No memories match your search.'
        : filter === 'all'
          ? 'No memories to show.'
          : `No ${filter} memories yet.`;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-heading">
        <p className="dashboard-eyebrow">Your private collection</p>
        <h1>Memories</h1>
        <p>
          Keep the notes that matter close, and choose what appears on your
          public page.
        </p>
      </header>
      <div className="memory-toolbar">
        <label className="memory-search">
          <span className="sr-only">Search memories</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your memories..."
          />
        </label>
        <label className="memory-sort">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>
      <div className="memory-filters" aria-label="Filter memories">
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
            {name === 'all' ? ` (${memories.length})` : ''}
          </button>
        ))}
      </div>
      {shown.length ? (
        <div className="owner-memory-list">
          {shown.map((memory) => (
            <OwnerMemoryCard
              key={memory.id}
              memory={memory}
              onUpdate={updateMemory}
              onDelete={deleteMemory}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty large">
          <span aria-hidden="true">♡</span>
          <h2>{emptyMessage}</h2>
          <p>
            {memories.length
              ? 'Try a different search or filter.'
              : 'Share your personal page with your friends and their messages will appear here.'}
          </p>
          {memories.length === 0 && (
            <ShareLinkCard
              username={profile.username}
              displayName={profile.display_name}
              mode={profile.memory_book_mode}
              compact
            />
          )}
        </div>
      )}
    </div>
  );
}
