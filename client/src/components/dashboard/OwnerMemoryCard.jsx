import PropTypes from 'prop-types';
import { useState } from 'react';

const PREVIEW_LENGTH = 360;

export default function OwnerMemoryCard({
  memory,
  onUpdate,
  onDelete,
  condensed = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const long = memory.message.length > PREVIEW_LENGTH;
  const message =
    long && !expanded
      ? `${memory.message.slice(0, PREVIEW_LENGTH).trim()}…`
      : memory.message;

  async function update(action, updates) {
    setBusyAction(action);
    setError('');
    try {
      await onUpdate(memory.id, updates);
    } catch (mutationError) {
      setError(
        mutationError.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setBusyAction('');
    }
  }

  async function remove() {
    setBusyAction('delete');
    setError('');
    try {
      await onDelete(memory.id);
    } catch (mutationError) {
      setError(mutationError.message || 'Could not delete this memory.');
      setBusyAction('');
    }
  }

  return (
    <article
      className={`owner-memory-card${memory.is_hidden ? ' hidden' : ''}${condensed ? ' condensed' : ''}`}
    >
      <div className="owner-memory-meta">
        <div>
          <p className="owner-memory-author">
            {memory.is_anonymous ? 'Anonymous' : memory.author_name}
          </p>
          <time dateTime={memory.created_at}>
            {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
              new Date(memory.created_at),
            )}
          </time>
        </div>
        <div className="memory-badges">
          {memory.is_pinned && <span>Pinned</span>}
          {memory.is_favorite && <span>Favorite</span>}
          {memory.is_hidden && <span>Hidden</span>}
        </div>
      </div>
      <p className="owner-memory-message">“{message}”</p>
      {long && (
        <button
          className="read-more"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
      {!condensed && (
        <div className="memory-actions" aria-label="Memory actions">
          <button
            disabled={Boolean(busyAction)}
            type="button"
            aria-pressed={memory.is_favorite}
            onClick={() =>
              update('favorite', { is_favorite: !memory.is_favorite })
            }
          >
            {busyAction === 'favorite'
              ? 'Saving...'
              : memory.is_favorite
                ? 'Unfavorite'
                : 'Favorite'}
          </button>
          <button
            disabled={Boolean(busyAction)}
            type="button"
            aria-pressed={memory.is_pinned}
            onClick={() => update('pin', { is_pinned: !memory.is_pinned })}
          >
            {busyAction === 'pin'
              ? 'Saving...'
              : memory.is_pinned
                ? 'Unpin'
                : 'Pin'}
          </button>
          <button
            disabled={Boolean(busyAction)}
            type="button"
            aria-pressed={memory.is_hidden}
            onClick={() => update('hide', { is_hidden: !memory.is_hidden })}
          >
            {busyAction === 'hide'
              ? 'Saving...'
              : memory.is_hidden
                ? 'Unhide'
                : 'Hide'}
          </button>
          <button
            className="danger"
            disabled={Boolean(busyAction)}
            type="button"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </button>
        </div>
      )}
      {memory.is_hidden && (
        <p className="hidden-note">Only you can see this memory.</p>
      )}
      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}
      {confirmingDelete && (
        <div
          className="delete-confirmation"
          role="alertdialog"
          aria-labelledby={`delete-title-${memory.id}`}
        >
          <h3 id={`delete-title-${memory.id}`}>Delete this memory?</h3>
          <p>This action cannot be undone.</p>
          <div className="dashboard-actions">
            <button
              className="dashboard-button secondary"
              disabled={busyAction === 'delete'}
              type="button"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
            <button
              className="dashboard-button danger"
              disabled={busyAction === 'delete'}
              type="button"
              onClick={remove}
            >
              {busyAction === 'delete' ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

OwnerMemoryCard.propTypes = {
  memory: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  condensed: PropTypes.bool,
};
OwnerMemoryCard.defaultProps = {
  onUpdate: async () => {},
  onDelete: async () => {},
  condensed: false,
};
