import PropTypes from 'prop-types';

export default function MemoryCard({ memory }) {
  return (
    <article className="memory-card">
      <p className="memory-from">
        From {memory.is_anonymous ? 'Anonymous' : memory.author_name}
      </p>
      <p className="memory-message">“{memory.message}”</p>
      <time dateTime={memory.created_at}>
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(
          new Date(memory.created_at),
        )}
      </time>
    </article>
  );
}

MemoryCard.propTypes = { memory: PropTypes.object.isRequired };
