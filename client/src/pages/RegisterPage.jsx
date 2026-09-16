import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import AuthForm from '../components/AuthForm.jsx';
import { validateUsername } from '../utils/username.js';

export default function RegisterPage() {
  const { register, configured } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const values = new FormData(event.currentTarget);
    const username = validateUsername(String(values.get('username')));
    if (!username.valid) return setError(username.error);
    try {
      const data = await register({
        displayName: String(values.get('displayName')).trim(),
        username: username.value,
        email: values.get('email'),
        password: values.get('password'),
      });
      if (data.session) navigate('/dashboard', { replace: true });
      else setNotice('Check your email to confirm your account, then log in.');
    } catch (authError) {
      const message = authError.message?.toLowerCase().includes('database')
        ? 'That username is unavailable or the profile details are invalid.'
        : authError.message;
      setError(message || 'Registration failed');
    }
  }

  return (
    <AuthForm
      title="Register"
      submitLabel="Create account"
      error={error}
      onSubmit={handleSubmit}
    >
      {!configured && (
        <p role="alert">
          Add the Vite Supabase environment variables to continue.
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <label className="grid gap-1">
        Display name
        <input
          className="rounded-xl border p-3"
          name="displayName"
          maxLength="100"
          required
        />
      </label>
      <label className="grid gap-1">
        Username
        <input
          className="rounded-xl border p-3"
          name="username"
          minLength="3"
          maxLength="30"
          autoComplete="username"
          required
        />
      </label>
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
          minLength="8"
          autoComplete="new-password"
          required
        />
      </label>
    </AuthForm>
  );
}
