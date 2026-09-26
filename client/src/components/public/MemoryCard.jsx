import PropTypes from 'prop-types';
import { useId, useState } from 'react';
import MemoryPhoto from './MemoryPhoto.jsx';
import AutographDecoration from './AutographDecorations.jsx';

const PREVIEW_LENGTH = 420;

export default function MemoryCard({ memory, prompt = '' }) {
  const [expanded, setExpanded] = useState(false);
  const messageId = useId();
  const long = memory.message.length > PREVIEW_LENGTH;
  const message =
    long && !expanded
      ? `${memory.message.slice(0, PREVIEW_LENGTH).trim()}…`
      : memory.message;
  const variants = ['flower', 'heart', 'sparkle', 'leaf'];
  const seed = String(memory.id || memory.created_at)
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  const motif = variants[seed % variants.length];
  const variant = (seed % 3) + 1;

  return (
    <article className={`memory-card memory-card-${variant}`}>
      <AutographDecoration motif={motif} className="memory-motif" />
      <header className="memory-card-header">
        <span className="memory-from-label">A note from</span>
        <p className="memory-from">
          {memory.is_anonymous ? 'Anonymous' : memory.author_name}
        </p>
      </header>
      {prompt && (
        <p className="memory-prompt">
          <span aria-hidden="true">✦</span> In response to “{prompt}”
        </p>
      )}
      {memory.photo_url && (
        <MemoryPhoto
          src={memory.photo_url}
          author={memory.is_anonymous ? 'Anonymous' : memory.author_name}
        />
      )}
      <p className="memory-message" id={messageId}>
        <span className="screen-message">“{message}”</span>
        {long && (
          <span className="print-message" aria-hidden="true">
            “{memory.message}”
          </span>
        )}
      </p>
      {long && (
        <button
          className="read-more"
          type="button"
          aria-expanded={expanded}
          aria-controls={messageId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
      <time dateTime={memory.created_at}>
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(
          new Date(memory.created_at),
        )}
      </time>
    </article>
  );
}

MemoryCard.propTypes = {
  memory: PropTypes.object.isRequired,
  prompt: PropTypes.string,
};
