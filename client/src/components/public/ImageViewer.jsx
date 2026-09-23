import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ImageViewer({ src, alt, onClose }) {
  const closeRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  return createPortal(
    <div
      className="image-viewer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Memory photo viewer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
        if (event.key === 'Tab') {
          event.preventDefault();
          closeRef.current?.focus();
        }
      }}
    >
      <button
        ref={closeRef}
        className="image-viewer-close"
        type="button"
        onClick={onClose}
        aria-label="Close photo viewer"
      >
        ×
      </button>
      {failed ? (
        <p className="image-unavailable" role="status">
          This photo is no longer available. Refresh the page to try again.
        </p>
      ) : (
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      )}
    </div>,
    document.body,
  );
}

ImageViewer.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
