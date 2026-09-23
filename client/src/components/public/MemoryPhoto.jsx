import PropTypes from 'prop-types';
import { useState } from 'react';
import ImageViewer from './ImageViewer.jsx';

export default function MemoryPhoto({ src, author, owner = false }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const alt = `Photo attached to ${author}'s memory`;

  if (failed) {
    return (
      <p className="memory-photo-error" role="status">
        Photo unavailable. Refresh the page to try again.
      </p>
    );
  }

  return (
    <>
      <button
        className={`memory-photo-button${owner ? ' owner-photo' : ''}`}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${alt.toLowerCase()}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </button>
      {open && (
        <ImageViewer src={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

MemoryPhoto.propTypes = {
  src: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  owner: PropTypes.bool,
};
