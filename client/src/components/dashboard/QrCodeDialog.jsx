import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

export default function QrCodeDialog({ url, username, onClose }) {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    let active = true;
    const previousFocus = document.activeElement;
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(url, {
          width: 640,
          margin: 3,
          errorCorrectionLevel: 'M',
          color: { dark: '#3d302b', light: '#fffaf0' },
        }),
      )
      .then((dataUrl) => {
        if (active) setImageUrl(dataUrl);
      })
      .catch(() => {
        if (active)
          setError('The QR code could not be created. Please try again.');
      });
    closeRef.current?.focus();
    return () => {
      active = false;
      previousFocus?.focus();
    };
  }, [url]);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = [
      ...dialogRef.current.querySelectorAll('a[href], button:not(:disabled)'),
    ];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div className="modal-backdrop qr-backdrop">
      <section
        ref={dialogRef}
        className="qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-dialog-title"
        aria-describedby="qr-dialog-description"
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeRef}
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="Close QR code"
        >
          ×
        </button>
        <p className="dashboard-eyebrow">Ready to share</p>
        <h2 id="qr-dialog-title">Share your memory book</h2>
        <p id="qr-dialog-description">
          Friends can scan this code to open your public page and leave a
          memory.
        </p>
        <div className="qr-code-frame" role="status">
          {imageUrl ? (
            <img src={imageUrl} alt={`QR code for ${username}'s memory book`} />
          ) : error ? (
            <p className="dashboard-error" role="alert">
              {error}
            </p>
          ) : (
            <div className="qr-loading">
              <span className="dashboard-loader" aria-hidden="true" />
              Creating QR code…
            </div>
          )}
        </div>
        <p className="qr-url">{url}</p>
        <div className="dashboard-actions">
          {imageUrl && (
            <a
              className="dashboard-button primary"
              href={imageUrl}
              download={`ourpages-${username}-qr.png`}
            >
              Download QR
            </a>
          )}
          <button
            className="dashboard-button secondary"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

QrCodeDialog.propTypes = {
  url: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
