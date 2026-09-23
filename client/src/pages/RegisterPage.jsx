import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import AuthForm from '../components/AuthForm.jsx';
import { validateUsername } from '../utils/username.js';

export default function RegisterPage() {
  const { register, configured } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    const values = new FormData(event.currentTarget);
    const username = validateUsername(String(values.get('username')));
    if (!username.valid) {
      setSubmitting(false);
      return setError(username.error);
    }
    try {
      const data = await register({
        displayName: String(values.get('displayName')).trim(),
        username: username.value,
        email: values.get('email'),
        password: values.get('password'),
      });
      if (data.session) navigate('/dashboard', { replace: true });
      else {
        setNotice('Check your email to confirm your account, then log in.');
        setSubmitting(false);
      }
    } catch (authError) {
      const message = authError.message?.toLowerCase().includes('database')
        ? 'That username is unavailable or the profile details are invalid.'
        : authError.message;
      setError(message || 'Registration failed');
      setSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Create your memory book"
      subtitle="A personal place for stories, notes, and moments worth keeping."
      submitLabel="Create account"
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
    >
      {!configured && (
        <p role="alert">
          Add the Vite Supabase environment variables to continue.
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <label>
        Display name
        <input name="displayName" maxLength="100" required />
      </label>
      <label>
        Username
        <input
          name="username"
          minLength="3"
          maxLength="30"
          autoComplete="username"
          aria-describedby="username-help"
          required
        />
      </label>
      <p className="auth-field-note" id="username-help">
        3–30 lowercase letters, numbers, or underscores. It will not be changed
        silently.
      </p>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          minLength="8"
          autoComplete="new-password"
          required
        />
      </label>
      <p className="auth-switch">
        Already have a book? <Link to="/login">Log in</Link>
      </p>
    </AuthForm>
  );
}
