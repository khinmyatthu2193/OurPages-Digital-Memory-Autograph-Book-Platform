import PropTypes from 'prop-types';

export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  submitting = false,
  error,
  children,
  onSubmit,
}) {
  return (
    <section className="auth-card">
      <div className="auth-brand" aria-hidden="true">
        <span>✳</span> OurPages
      </div>
      <h1>{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>
      <form className="auth-form" onSubmit={onSubmit}>
        {children}
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Please wait…' : submitLabel}
        </button>
      </form>
    </section>
  );
}

AuthForm.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
