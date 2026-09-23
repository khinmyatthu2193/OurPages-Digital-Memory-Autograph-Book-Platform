import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import AuthForm from '../components/AuthForm.jsx';

export default function LoginPage() {
  const { login, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const values = new FormData(event.currentTarget);
    try {
      await login({
        email: values.get('email'),
        password: values.get('password'),
      });
      navigate(location.state?.from ?? '/dashboard', { replace: true });
    } catch (authError) {
      setError(
        authError.message?.toLowerCase().includes('invalid')
          ? 'That email or password is not correct.'
          : 'We could not sign you in. Please try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Log in"
      subtitle="Come back to the memories that matter."
      submitLabel="Log in"
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
    >
      {!configured && (
        <p role="alert">
          Add the Vite Supabase environment variables to continue.
        </p>
      )}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <p className="auth-switch">
        New to OurPages? <Link to="/register">Create your memory book</Link>
      </p>
    </AuthForm>
  );
}
