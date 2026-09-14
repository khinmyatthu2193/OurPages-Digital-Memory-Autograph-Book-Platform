import PropTypes from 'prop-types';

export default function PagePlaceholder({ eyebrow, title, children }) {
  return (
    <section className="rounded-3xl border border-rose-200/70 bg-white/70 p-8 shadow-sm">
      <p className="mb-2 text-sm font-medium tracking-wide text-rosewood uppercase">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-stone-600">{children}</p>
    </section>
  );
}

PagePlaceholder.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
