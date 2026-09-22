import PropTypes from 'prop-types';
import { useState } from 'react';

export default function ShareLinkCard({ username, compact = false }) {
  const [copyState, setCopyState] = useState('');
  const path = `/u/${username}`;
  const url =
    typeof window === 'undefined' ? path : `${window.location.origin}${path}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('Link copied!');
    } catch {
      setCopyState('Could not copy the link. Select it and copy it manually.');
    }
  }

  return (
    <section
      className={`dashboard-card share-card${compact ? ' compact' : ''}`}
      aria-labelledby="share-card-title"
    >
      <p className="dashboard-eyebrow">Your memory book</p>
      <h2 id="share-card-title">Share your page</h2>
      <label
        className="sr-only"
        htmlFor={`public-link-${compact ? 'compact' : 'full'}`}
      >
        Public page link
      </label>
      <input
        id={`public-link-${compact ? 'compact' : 'full'}`}
        className="share-url"
        value={url}
        readOnly
        onFocus={(event) => event.target.select()}
      />
      <div className="dashboard-actions">
        <a
          className="dashboard-button secondary"
          href={path}
          target="_blank"
          rel="noreferrer"
        >
          Open my page
        </a>
        <button
          className="dashboard-button primary"
          type="button"
          onClick={copyLink}
        >
          Copy link
        </button>
      </div>
      {copyState && (
        <p className="dashboard-feedback" role="status">
          {copyState}
        </p>
      )}
    </section>
  );
}

ShareLinkCard.propTypes = {
  username: PropTypes.string.isRequired,
  compact: PropTypes.bool,
};
