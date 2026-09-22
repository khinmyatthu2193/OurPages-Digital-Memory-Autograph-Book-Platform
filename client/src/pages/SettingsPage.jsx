import { useState } from 'react';
import { useDashboard } from '../components/dashboard/dashboard-context.js';

export default function SettingsPage() {
  const { profile, updateProfile } = useDashboard();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');
    try {
      await updateProfile({ display_name: displayName, bio });
      setFeedback('Profile saved.');
    } catch (saveError) {
      setError(saveError.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page settings-page">
      <header className="dashboard-page-heading">
        <p className="dashboard-eyebrow">A little about you</p>
        <h1>Settings</h1>
        <p>Update the details friends see when they visit your page.</p>
      </header>
      <form className="settings-form dashboard-card" onSubmit={submit}>
        <label>
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={100}
            required
          />
        </label>
        <label>
          Username
          <input
            value={profile.username}
            readOnly
            aria-describedby="username-note"
          />
        </label>
        <p id="username-note" className="field-note">
          Your username and public link stay fixed for now.
        </p>
        <label>
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
            rows={5}
            placeholder="A short note for visitors to your page"
          />
        </label>
        <p className="field-note">{bio.length} / 500</p>
        {error && (
          <p className="dashboard-error" role="alert">
            {error}
          </p>
        )}
        {feedback && (
          <p className="dashboard-feedback" role="status">
            {feedback}
          </p>
        )}
        <button
          className="dashboard-button primary"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
