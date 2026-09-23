import { useState } from 'react';
import { useDashboard } from '../components/dashboard/dashboard-context.js';
import { useToast } from '../components/feedback/toast-context.js';

export default function SettingsPage() {
  const { profile, updateProfile } = useDashboard();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [mode, setMode] = useState(profile.memory_book_mode ?? 'standard');
  const [graduationTitle, setGraduationTitle] = useState(
    profile.graduation_title ?? '',
  );
  const [graduationClass, setGraduationClass] = useState(
    profile.graduation_class ?? '',
  );
  const [graduationYear, setGraduationYear] = useState(
    profile.graduation_year?.toString() ?? '',
  );
  const [graduationMessage, setGraduationMessage] = useState(
    profile.graduation_message ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const { notify } = useToast();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');
    try {
      await updateProfile({
        display_name: displayName,
        bio,
        memory_book_mode: mode,
        graduation_title: graduationTitle,
        graduation_class: graduationClass,
        graduation_year: graduationYear ? Number(graduationYear) : null,
        graduation_message: graduationMessage,
      });
      setFeedback('Profile saved.');
      notify('Profile updated');
    } catch (saveError) {
      setError(saveError.message || 'Could not save your profile.');
      notify('Could not save your profile', 'error');
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
        <fieldset className="mode-settings">
          <legend>Memory book style</legend>
          <label className="mode-option">
            <input
              type="radio"
              name="memory-book-mode"
              value="standard"
              checked={mode === 'standard'}
              onChange={(event) => setMode(event.target.value)}
            />
            <span>
              <strong>Standard</strong>
              <small>A personal memory and autograph book.</small>
            </span>
          </label>
          <label className="mode-option">
            <input
              type="radio"
              name="memory-book-mode"
              value="graduation"
              checked={mode === 'graduation'}
              onChange={(event) => setMode(event.target.value)}
            />
            <span>
              <strong>Graduation / Farewell</strong>
              <small>
                A special page for graduation, farewell, or the end of a
                chapter.
              </small>
            </span>
          </label>
        </fieldset>
        {mode === 'graduation' && (
          <fieldset className="graduation-settings">
            <legend>Graduation / farewell details</legend>
            <p className="field-note">
              All details are optional. Add only what makes the page feel like
              yours.
            </p>
            <label>
              Title
              <input
                value={graduationTitle}
                onChange={(event) => setGraduationTitle(event.target.value)}
                maxLength={120}
                placeholder="Final Year Farewell"
              />
            </label>
            <label>
              Class / group
              <input
                value={graduationClass}
                onChange={(event) => setGraduationClass(event.target.value)}
                maxLength={120}
                placeholder="Your class, course, or group"
              />
            </label>
            <label>
              Year
              <input
                value={graduationYear}
                onChange={(event) => setGraduationYear(event.target.value)}
                type="number"
                min="1900"
                max="2200"
                inputMode="numeric"
                placeholder="2026"
              />
            </label>
            <label>
              Farewell message
              <textarea
                value={graduationMessage}
                onChange={(event) => setGraduationMessage(event.target.value)}
                maxLength={600}
                rows={5}
                placeholder="A short note about this chapter"
              />
            </label>
            <p className="field-note">{graduationMessage.length} / 600</p>
          </fieldset>
        )}
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
