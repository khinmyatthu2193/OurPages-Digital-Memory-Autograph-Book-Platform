import PropTypes from 'prop-types';

export default function PublicBookHeader({ profile, open, onLeaveMemory }) {
  const graduation = profile.memory_book_mode === 'graduation';
  const classLine = [profile.graduation_class, profile.graduation_year]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className={`book-hero${graduation ? ' graduation-hero' : ''}`}>
      {graduation && (
        <>
          <p className="eyebrow">A chapter to remember</p>
          <h1>
            {profile.graduation_title ||
              `${profile.display_name}'s farewell book`}
          </h1>
          {classLine && <p className="graduation-class">{classLine}</p>}
          <div className="graduation-rule" aria-hidden="true">
            <span>✦</span>
          </div>
        </>
      )}
      {profile.avatar_url ? (
        <img className="avatar" src={profile.avatar_url} alt="" />
      ) : (
        <div className="avatar fallback" aria-hidden="true">
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
      )}
      {!graduation && <p className="eyebrow">OurPages memory book</p>}
      {graduation ? (
        <h2 className="graduation-name">{profile.display_name}</h2>
      ) : (
        <h1>{profile.display_name}&apos;s OurPages</h1>
      )}
      <p className="username">@{profile.username}</p>
      {graduation ? (
        <p className="bio graduation-message">
          {profile.graduation_message ||
            profile.bio ||
            'A chapter is ending, but the memories stay with us.'}
        </p>
      ) : (
        profile.bio && <p className="bio">{profile.bio}</p>
      )}
      <p className="introduction">
        {graduation
          ? 'Leave a few words for the next chapter.'
          : 'Leave a little memory behind.'}
      </p>
      {open ? (
        <button
          className="primary-button"
          type="button"
          onClick={onLeaveMemory}
        >
          {graduation ? 'Leave a Farewell Memory' : 'Leave a Memory'}
        </button>
      ) : (
        <p className="status-note">
          <strong>This memory book is currently closed.</strong>
          <span>
            You can still read the memories, but new ones cannot be added right
            now.
          </span>
        </p>
      )}
    </section>
  );
}

PublicBookHeader.propTypes = {
  profile: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onLeaveMemory: PropTypes.func.isRequired,
};
