import BookStatusCard from '../components/dashboard/BookStatusCard.jsx';
import ShareLinkCard from '../components/dashboard/ShareLinkCard.jsx';
import { useDashboard } from '../components/dashboard/dashboard-context.js';

export default function MyPagePage() {
  const { profile, updateProfile } = useDashboard();
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-heading">
        <p className="dashboard-eyebrow">Your public presence</p>
        <h1>My page</h1>
        <p>This is what friends use to find your memory book.</p>
      </header>
      <section className="profile-preview dashboard-card">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" />
        ) : (
          <div className="profile-preview-avatar" aria-hidden="true">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="dashboard-eyebrow">
          {profile.memory_book_mode === 'graduation'
            ? 'Graduation / farewell mode'
            : 'OurPages memory book'}
        </p>
        <h2>
          {profile.memory_book_mode === 'graduation'
            ? profile.graduation_title ||
              `${profile.display_name}'s farewell book`
            : `${profile.display_name}'s OurPages`}
        </h2>
        <p className="profile-username">@{profile.username}</p>
        <p>
          {(profile.memory_book_mode === 'graduation' &&
            (profile.graduation_message || profile.graduation_class)) ||
            profile.bio ||
            'Add a short note in Settings to make your page feel more personal.'}
        </p>
      </section>
      <div className="dashboard-overview-grid">
        <ShareLinkCard
          username={profile.username}
          displayName={profile.display_name}
          mode={profile.memory_book_mode}
        />
        <BookStatusCard
          status={profile.memory_book_status}
          onChange={(status) => updateProfile({ memory_book_status: status })}
        />
      </div>
    </div>
  );
}
