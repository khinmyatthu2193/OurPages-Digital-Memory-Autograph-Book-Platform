import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MemoryCard from '../components/public/MemoryCard.jsx';
import MemoryForm from '../components/public/MemoryForm.jsx';
import { publicBookService } from '../services/publicBookService.js';

export default function PublicBookPage() {
  const { username } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    publicBookService
      .getBook(username)
      .then((data) => {
        if (active) setBook(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError);
      });
    return () => {
      active = false;
    };
  }, [username]);

  if (error) {
    const missing = error.code === 'BOOK_NOT_FOUND';
    return (
      <div className="empty-book" role="alert">
        <p className="eyebrow">OurPages</p>
        <h1>
          {missing
            ? "This OurPages page doesn't exist."
            : 'This page could not be loaded.'}
        </h1>
        <p>
          {missing
            ? 'Check the link and try again.'
            : 'Please try again in a moment.'}
        </p>
        <Link to="/">Return home</Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-page" role="status" aria-label="Loading memory book">
        <div className="book-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const { profile, memories, prompts } = book;
  const open = profile.memory_book_status === 'open';

  if (success) {
    return (
      <div className="success-book" role="status">
        <span aria-hidden="true">♥</span>
        <p className="eyebrow">Memory saved</p>
        <h1>Your memory has been added.</h1>
        <p>Thank you for leaving a little piece of your story behind.</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => setSuccess(false)}
        >
          Back to OurPages
        </button>
      </div>
    );
  }

  return (
    <div className="book-page">
      <section className="book-hero">
        {profile.avatar_url ? (
          <img className="avatar" src={profile.avatar_url} alt="" />
        ) : (
          <div className="avatar fallback" aria-hidden="true">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="eyebrow">OurPages memory book</p>
        <h1>{profile.display_name}&apos;s OurPages</h1>
        <p className="username">@{profile.username}</p>
        {profile.bio && <p className="bio">{profile.bio}</p>}
        <p className="introduction">Leave a little memory behind.</p>
        {open ? (
          <button
            className="primary-button"
            type="button"
            onClick={() => setFormOpen(true)}
          >
            Leave a Memory
          </button>
        ) : (
          <p className="status-note">
            This memory book is currently closed to new messages.
          </p>
        )}
      </section>
      <section className="memory-list" aria-labelledby="memories-heading">
        <div className="section-heading">
          <p className="eyebrow">Collected with care</p>
          <h2 id="memories-heading">Memories</h2>
        </div>
        {memories.length ? (
          memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))
        ) : (
          <p className="no-memories">
            The first memory is waiting to be written.
          </p>
        )}
      </section>
      {formOpen && (
        <MemoryForm
          username={profile.username}
          prompts={prompts}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            setSuccess(true);
          }}
        />
      )}
    </div>
  );
}
