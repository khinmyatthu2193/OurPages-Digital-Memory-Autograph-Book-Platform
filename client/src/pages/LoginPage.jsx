import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import AuthForm from '../components/AuthForm.jsx';

export default function LoginPage() {
  const { login, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const values = new FormData(event.currentTarget);
    try {
      await login({
        email: values.get('email'),
        password: values.get('password'),
      });
      navigate(location.state?.from ?? '/dashboard', { replace: true });
    } catch (authError) {
      setError(authError.message || 'Login failed');
    }
  }

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      error={error}
      onSubmit={handleSubmit}
    >
      {!configured && (
        <p role="alert">
          Add the Vite Supabase environment variables to continue.
        </p>
      )}
      <label className="grid gap-1">
        Email
        <input
          className="rounded-xl border p-3"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="grid gap-1">
        Password
        <input
          className="rounded-xl border p-3"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
    </AuthForm>
  );
}
