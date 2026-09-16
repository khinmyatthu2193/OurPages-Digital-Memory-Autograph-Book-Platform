import PropTypes from 'prop-types';

export default function AuthForm({
  title,
  submitLabel,
  error,
  children,
  onSubmit,
}) {
  return (
    <section className="mx-auto max-w-md rounded-3xl border border-rose-200/70 bg-white/70 p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
        {children}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          className="rounded-xl bg-rosewood px-4 py-3 font-medium text-white"
          type="submit"
        >
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

AuthForm.propTypes = {
  title: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
