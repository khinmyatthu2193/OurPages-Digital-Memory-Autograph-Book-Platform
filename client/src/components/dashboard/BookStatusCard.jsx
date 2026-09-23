import PropTypes from 'prop-types';
import { useState } from 'react';
import { useToast } from '../feedback/toast-context.js';

export default function BookStatusCard({ status, onChange }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useToast();
  const open = status === 'open';

  async function toggleStatus() {
    setSaving(true);
    setError('');
    try {
      await onChange(open ? 'closed' : 'open');
      notify(`Memory book ${open ? 'closed' : 'opened'}`);
    } catch (mutationError) {
      setError(mutationError.message || 'Could not update your book.');
      notify('Could not update your memory book', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="dashboard-card status-card"
      aria-labelledby="book-status-title"
    >
      <p className="dashboard-eyebrow">Submissions</p>
      <h2 id="book-status-title">Memory book</h2>
      <p className={`book-status ${open ? 'open' : 'closed'}`}>
        <span aria-hidden="true" /> {open ? 'Open' : 'Closed'}
      </p>
      <p>
        {open
          ? 'Your friends can currently leave memories.'
          : 'New memory submissions are currently disabled.'}
      </p>
      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="dashboard-button secondary"
        disabled={saving}
        type="button"
        onClick={toggleStatus}
      >
        {saving ? 'Saving...' : open ? 'Close memory book' : 'Open memory book'}
      </button>
    </section>
  );
}

BookStatusCard.propTypes = {
  status: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
