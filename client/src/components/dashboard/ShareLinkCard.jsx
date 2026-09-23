import PropTypes from 'prop-types';
import { useState } from 'react';
import { useToast } from '../feedback/toast-context.js';
import QrCodeDialog from './QrCodeDialog.jsx';

export default function ShareLinkCard({
  username,
  displayName = '',
  mode = 'standard',
  compact = false,
}) {
  const [copyState, setCopyState] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const { notify } = useToast();
  const graduation = mode === 'graduation';
  const path = `/u/${username}`;
  const url =
    typeof window === 'undefined' ? path : `${window.location.origin}${path}`;
  const ownerName = displayName || username;
  const shareTitle = `${ownerName}'s ${graduation ? 'Farewell ' : ''}Memory Book`;
  const shareText = graduation
    ? `Leave a farewell memory for ${ownerName} on OurPages.`
    : `Leave a memory for ${ownerName} on OurPages.`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState('Link copied');
      notify('Memory book link copied');
    } catch {
      setCopyState('Could not copy the link. Select it and copy it manually.');
      notify('Could not copy the link', 'error');
    }
  }

  async function shareLink() {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url });
    } catch (error) {
      if (error.name !== 'AbortError') await copyLink();
    }
  }

  return (
    <>
      <section
        className={`dashboard-card share-card${compact ? ' compact' : ''}`}
        aria-labelledby={`share-card-title-${compact ? 'compact' : 'full'}`}
      >
        <p className="dashboard-eyebrow">
          Your {graduation ? 'farewell ' : ''}memory book
        </p>
        <h2 id={`share-card-title-${compact ? 'compact' : 'full'}`}>
          Share your page
        </h2>
        <p className="share-description">
          {graduation
            ? 'Share this page with classmates and friends before the chapter ends.'
            : 'Share this link with friends so they can leave a memory.'}
        </p>
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
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              className="dashboard-button secondary"
              type="button"
              onClick={shareLink}
            >
              Share
            </button>
          )}
          <button
            className="dashboard-button secondary"
            type="button"
            onClick={() => setQrOpen(true)}
          >
            QR code
          </button>
        </div>
        {copyState && (
          <p className="dashboard-feedback" role="status">
            {copyState}
          </p>
        )}
      </section>
      {qrOpen && (
        <QrCodeDialog
          url={url}
          username={username}
          onClose={() => setQrOpen(false)}
        />
      )}
    </>
  );
}

ShareLinkCard.propTypes = {
  username: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  mode: PropTypes.oneOf(['standard', 'graduation']),
  compact: PropTypes.bool,
};
