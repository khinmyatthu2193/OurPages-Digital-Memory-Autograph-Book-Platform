import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '../feedback/toast-context.js';
import MemoryPhoto from '../public/MemoryPhoto.jsx';

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
  const { notify } = useToast();
  const cancelDeleteRef = useRef(null);
  const long = memory.message.length > PREVIEW_LENGTH;
  const message =
    long && !expanded
      ? `${memory.message.slice(0, PREVIEW_LENGTH).trim()}…`
      : memory.message;

  useEffect(() => {
    if (confirmingDelete) cancelDeleteRef.current?.focus();
  }, [confirmingDelete]);

  async function update(action, updates) {
    setBusyAction(action);
    setError('');
    try {
      await onUpdate(memory.id, updates);
      const messages = {
        favorite: updates.is_favorite ? 'Memory favorited' : 'Favorite removed',
        pin: updates.is_pinned ? 'Memory pinned' : 'Memory unpinned',
        hide: updates.is_hidden
          ? 'Memory hidden from your public page'
          : 'Memory made public',
      };
      notify(messages[action]);
    } catch (mutationError) {
      setError(
        mutationError.message || 'Something went wrong. Please try again.',
      );
      notify('Could not update this memory', 'error');
    } finally {
      setBusyAction('');
    }
  }

  async function remove() {
    setBusyAction('delete');
    setError('');
    try {
      await onDelete(memory.id);
      notify('Memory deleted');
    } catch (mutationError) {
      setError(mutationError.message || 'Could not delete this memory.');
      notify('Could not delete this memory', 'error');
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
      {memory.photo_url && (
        <MemoryPhoto
          src={memory.photo_url}
          author={memory.is_anonymous ? 'Anonymous' : memory.author_name}
          owner
        />
      )}
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
          aria-modal="true"
          aria-labelledby={`delete-title-${memory.id}`}
          aria-describedby={`delete-description-${memory.id}`}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && busyAction !== 'delete') {
              event.preventDefault();
              setConfirmingDelete(false);
            }
          }}
        >
          <h3 id={`delete-title-${memory.id}`}>Delete this memory?</h3>
          <p id={`delete-description-${memory.id}`}>
            This action cannot be undone.
          </p>
          <div className="dashboard-actions">
            <button
              ref={cancelDeleteRef}
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
