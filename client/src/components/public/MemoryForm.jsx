import PropTypes from 'prop-types';
import { useEffect, useId, useRef, useState } from 'react';
import { publicBookService } from '../../services/publicBookService.js';

const MAX_LENGTH = 2000;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function createSubmissionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

export default function MemoryForm({
  username,
  prompts,
  graduation = false,
  onSuccess,
  onClose,
}) {
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setAnonymous] = useState(false);
  const [promptId, setPromptId] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const photoInputRef = useRef(null);
  const submissionIdRef = useRef(createSubmissionId());
  const nameId = useId();
  const messageId = useId();
  const errorId = useId();
  const countId = useId();
  const photoId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    if (!PHOTO_TYPES.includes(file.type)) {
      event.target.value = '';
      return setError('Please choose a JPG, PNG, or WebP image.');
    }
    if (file.size > MAX_PHOTO_BYTES) {
      event.target.value = '';
      return setError(
        'This photo is larger than 5 MB. Please choose a smaller image.',
      );
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

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
        submissionId: submissionIdRef.current,
        photo,
        website: new FormData(event.currentTarget).get('website') || '',
      });
      onSuccess({ hasPhoto: Boolean(photo) });
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
        aria-describedby="memory-form-description"
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
        <h2 id="memory-form-title">
          Leave a {graduation ? 'farewell ' : ''}memory
        </h2>
        <p id="memory-form-description" className="form-intro">
          Share a moment, an inside joke, or a few words they can keep.
        </p>
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
              Need a little inspiration? <span>(optional)</span>
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
          <div className="photo-field">
            <label htmlFor={photoId}>Optional photo</label>
            {photoPreview ? (
              <div className="photo-preview">
                <img
                  src={photoPreview}
                  alt="Selected memory attachment preview"
                />
                <p>{photo.name}</p>
                <div>
                  <label className="photo-action" htmlFor={photoId}>
                    Change
                  </label>
                  <button
                    className="photo-action"
                    type="button"
                    onClick={removePhoto}
                    disabled={submitting}
                    aria-label="Remove selected photo"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="photo-picker" htmlFor={photoId}>
                <span aria-hidden="true">＋</span>
                <strong>Add a photo</strong>
                <small>JPG, PNG or WebP · Max 5 MB</small>
              </label>
            )}
            <input
              ref={photoInputRef}
              id={photoId}
              className="photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={submitting}
              onChange={selectPhoto}
            />
          </div>
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
            {submitting
              ? photo
                ? 'Uploading your memory...'
                : 'Saving your memory...'
              : `Save this ${graduation ? 'farewell ' : ''}memory`}
          </button>
        </form>
      </section>
    </div>
  );
}

MemoryForm.propTypes = {
  username: PropTypes.string.isRequired,
  prompts: PropTypes.array.isRequired,
  graduation: PropTypes.bool,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
