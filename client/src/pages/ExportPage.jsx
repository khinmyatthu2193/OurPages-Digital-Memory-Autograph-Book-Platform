import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import { dashboardService } from '../services/dashboardService.js';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(
    new Date(value),
  );
}

function ExportPhoto({ src, author }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <p className="export-photo-unavailable" role="status">
        Attached photo unavailable.
      </p>
    );
  }
  return (
    <img
      className="export-photo"
      src={src}
      alt={`Photo attached to ${author}'s memory`}
      onError={() => setFailed(true)}
    />
  );
}

ExportPhoto.propTypes = {
  src: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
};

export default function ExportPage() {
  const { session } = useAuth();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    dashboardService
      .getExportBook(session?.access_token)
      .then((data) => {
        if (active) setBook(data);
      })
      .catch((requestError) => {
        if (active)
          setError(requestError.message || "We couldn't prepare your export.");
      });
    return () => {
      active = false;
    };
  }, [session?.access_token]);

  const title = useMemo(() => {
    if (!book) return 'Memory Book Export | OurPages';
    const graduation = book.profile.memory_book_mode === 'graduation';
    return `${book.profile.display_name}'s ${graduation ? 'Graduation ' : ''}Memory Book | OurPages`;
  }, [book]);

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  if (error) {
    return (
      <main className="export-state" role="alert">
        <p className="export-kicker">OurPages preservation</p>
        <h1>We couldn&apos;t prepare your memory book.</h1>
        <p>{error}</p>
        <Link className="dashboard-button secondary" to="/dashboard">
          Back to dashboard
        </Link>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="export-state" role="status" aria-live="polite">
        <span className="dashboard-loader" aria-hidden="true" />
        Preparing your memory book preview...
      </main>
    );
  }

  const { profile, memories } = book;
  const graduation = profile.memory_book_mode === 'graduation';
  const coverTitle = graduation
    ? profile.graduation_title || 'Graduation Memories'
    : `${profile.display_name}'s Memory Book`;

  return (
    <main className={`export-preview${graduation ? ' graduation' : ''}`}>
      <nav className="export-toolbar" aria-label="Export actions">
        <div>
          <p className="export-kicker">Print preview</p>
          <strong>{memories.length} visible memories</strong>
        </div>
        <div className="export-actions">
          <Link className="dashboard-button secondary" to="/dashboard">
            Back to dashboard
          </Link>
          <button
            className="dashboard-button primary"
            type="button"
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
        </div>
      </nav>

      <article className="export-book" aria-label={`${coverTitle} preview`}>
        <header className="export-cover">
          <div className="export-cover-ornament" aria-hidden="true">
            ✦
          </div>
          <p className="export-brand">OurPages</p>
          {profile.avatar_url && (
            <img
              className="export-avatar"
              src={profile.avatar_url}
              alt={`${profile.display_name}'s profile`}
            />
          )}
          <p className="export-cover-label">
            {graduation
              ? 'A farewell keepsake for'
              : 'A collection of memories for'}
          </p>
          <h1>{profile.display_name}</h1>
          <div className="export-cover-rule" aria-hidden="true" />
          <h2>{coverTitle}</h2>
          {graduation &&
            (profile.graduation_class || profile.graduation_year) && (
              <p className="export-class-year">
                {[profile.graduation_class, profile.graduation_year]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          {(graduation ? profile.graduation_message : profile.bio) && (
            <p className="export-subtitle">
              {graduation ? profile.graduation_message : profile.bio}
            </p>
          )}
          <p className="export-cover-footer">Created with OurPages</p>
        </header>

        <section
          className="export-pages"
          aria-labelledby="export-memories-title"
        >
          <header className="export-section-heading">
            <p className="export-kicker">Collected with care</p>
            <h2 id="export-memories-title">Memories</h2>
          </header>
          {memories.length ? (
            <div className="export-memory-list">
              {memories.map((memory, index) => {
                const author = memory.is_anonymous
                  ? 'Anonymous'
                  : memory.author_name;
                return (
                  <article
                    className="export-memory"
                    key={`${memory.created_at}-${index}`}
                  >
                    <header>
                      <p>From {author}</p>
                      <time dateTime={memory.created_at}>
                        {formatDate(memory.created_at)}
                      </time>
                    </header>
                    {memory.prompt && (
                      <p className="export-prompt">
                        In response to “{memory.prompt}”
                      </p>
                    )}
                    {memory.photo_url && (
                      <ExportPhoto src={memory.photo_url} author={author} />
                    )}
                    <p className="export-message">“{memory.message}”</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="export-empty">
              <span aria-hidden="true">♡</span>
              <h3>Your memory book is still waiting for its first memory.</h3>
              <p>
                Share your page with friends, then return here when your first
                memory arrives.
              </p>
              <Link to="/dashboard">Back to dashboard</Link>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
