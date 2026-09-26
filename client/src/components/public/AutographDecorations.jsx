import PropTypes from 'prop-types';

const motifs = {
  flower: (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M24 25c-9-1-12-8-9-12 3-4 8-1 9 4 1-5 6-8 9-4 3 4 0 11-9 12Z" />
      <path d="M24 23c-1 8-4 14-10 19M23 32c6-1 10 1 12 5" />
      <circle cx="24" cy="21" r="3" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M24 4c1 12 5 18 18 20-13 2-17 8-18 20-1-12-5-18-18-20C19 22 23 16 24 4Z" />
      <path d="M39 3c.3 4 2 6 6 7-4 .7-5.7 3-6 7-.3-4-2-6.3-6-7 4-.7 5.7-3 6-7Z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M24 41S7 31 7 17c0-8 10-12 17-4 7-8 17-4 17 4 0 14-17 24-17 24Z" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M39 8C20 8 9 18 9 35c13 3 26-5 30-27Z" />
      <path d="M8 41c8-12 16-19 28-29" />
    </svg>
  ),
};

export default function AutographDecoration({ motif, className = '' }) {
  return (
    <span
      className={`autograph-decoration ${className}`.trim()}
      aria-hidden="true"
    >
      {motifs[motif]}
    </span>
  );
}

AutographDecoration.propTypes = {
  motif: PropTypes.oneOf(Object.keys(motifs)).isRequired,
  className: PropTypes.string,
};
