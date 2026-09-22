import PropTypes from 'prop-types';
import { useEffect, useId, useRef, useState } from 'react';
import { publicBookService } from '../../services/publicBookService.js';

const MAX_LENGTH = 2000;

export default function MemoryForm({ username, prompts, onSuccess, onClose }) {
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setAnonymous] = useState(false);
  const [promptId, setPromptId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const nameId = useId();
  const messageId = useId();
  const errorId = useId();
  const countId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  function handleDialogKeyDown(event) {
    if (event.key === 'Escape' && !submitting) {
      event.preventDefault();
      onClose();
    }
    if (event.key !== 'Tab') return;
    const controls = [
      ...dialogRef.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled)',
      ),
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

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setError('');
    if (!message.trim())
      return setError('Please write a memory before saving.');
    if (!isAnonymous && !authorName.trim())
      return setError('Please add your name or post anonymously.');
    setSubmitting(true);
    try {
      await publicBookService.submitMemory(username, {
        authorName,
        message,
        isAnonymous,
        ...(promptId ? { promptId } : {}),
        website: new FormData(event.currentTarget).get('website') || '',
      });
      onSuccess();
    } catch (submissionError) {
      setError(
        submissionError.message ||
          'Your memory could not be saved. Please try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section
        ref={dialogRef}
        className="memory-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-form-title"
        onKeyDown={handleDialogKeyDown}
      >
        <button
          ref={closeRef}
          className="close-button"
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close memory form"
        >
          ×
        </button>
        <p className="eyebrow">A little note for @{username}</p>
        <h2 id="memory-form-title">Leave a memory</h2>
        <form onSubmit={submit}>
          <label htmlFor={nameId}>Your name</label>
          <input
            id={nameId}
            value={authorName}
            maxLength={100}
            disabled={isAnonymous || submitting}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="A nickname is welcome"
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={isAnonymous}
              disabled={submitting}
              onChange={(event) => setAnonymous(event.target.checked)}
            />{' '}
            Post anonymously
          </label>
          <fieldset disabled={submitting}>
            <legend>
              Choose a prompt <span>(optional)</span>
            </legend>
            <label className="prompt-option">
              <input
                type="radio"
                name="prompt"
                value=""
                checked={!promptId}
                onChange={() => setPromptId('')}
              />{' '}
              Write your own message
            </label>
            {prompts.map((prompt) => (
              <label className="prompt-option" key={prompt.id}>
                <input
                  type="radio"
                  name="prompt"
                  value={prompt.id}
                  checked={promptId === prompt.id}
                  onChange={(event) => setPromptId(event.target.value)}
                />{' '}
                {prompt.text}
              </label>
            ))}
          </fieldset>
          <label htmlFor={messageId}>Your memory</label>
          <textarea
            id={messageId}
            value={message}
            maxLength={MAX_LENGTH}
            required
            disabled={submitting}
            aria-describedby={`${countId}${error ? ` ${errorId}` : ''}`}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write something worth remembering..."
          />
          <p id={countId} className="character-count">
            {message.length} / {MAX_LENGTH}
          </p>
          <div className="honeypot-field" aria-hidden="true">
            <label htmlFor="memory-website">Website</label>
            <input
              id="memory-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          {error && (
            <p id={errorId} className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Saving your memory...' : 'Save this memory'}
          </button>
        </form>
      </section>
    </div>
  );
}

MemoryForm.propTypes = {
  username: PropTypes.string.isRequired,
  prompts: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
