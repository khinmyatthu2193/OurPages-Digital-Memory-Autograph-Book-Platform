import PropTypes from 'prop-types';
import { useId, useState } from 'react';
import MemoryPhoto from './MemoryPhoto.jsx';

const PREVIEW_LENGTH = 420;

export default function MemoryCard({ memory, prompt = '' }) {
  const [expanded, setExpanded] = useState(false);
  const messageId = useId();
  const long = memory.message.length > PREVIEW_LENGTH;
  const message =
    long && !expanded
      ? `${memory.message.slice(0, PREVIEW_LENGTH).trim()}…`
      : memory.message;

  return (
    <article className="memory-card">
      <p className="memory-from">
        From {memory.is_anonymous ? 'Anonymous' : memory.author_name}
      </p>
      {prompt && <p className="memory-prompt">In response to “{prompt}”</p>}
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
