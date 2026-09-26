import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import { useToast } from '../components/feedback/toast-context.js';
import MemoryCard from '../components/public/MemoryCard.jsx';
import MemoryForm from '../components/public/MemoryForm.jsx';
import PublicBookHeader from '../components/public/PublicBookHeader.jsx';
import AutographDecoration from '../components/public/AutographDecorations.jsx';
import { publicBookService } from '../services/publicBookService.js';

export default function PublicBookPage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { notify } = useToast();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [refreshingBook, setRefreshingBook] = useState(false);

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

  useEffect(() => {
    if (!book?.profile) return undefined;
    const displayName = book.profile.display_name;
    const previousTitle = document.title;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const openGraphTitle = document.querySelector('meta[property="og:title"]');
    const openGraphDescription = document.querySelector(
      'meta[property="og:description"]',
    );
    const previousDescription = descriptionMeta?.getAttribute('content');
    const previousOpenGraphTitle = openGraphTitle?.getAttribute('content');
    const previousOpenGraphDescription =
      openGraphDescription?.getAttribute('content');
    const graduation = book.profile.memory_book_mode === 'graduation';
    const title = `${displayName}'s ${graduation ? 'Farewell ' : ''}Memory Book | OurPages`;
    const description = graduation
      ? `Leave a farewell memory for ${displayName} on OurPages.`
      : `Read and leave a memory in ${displayName}'s personal OurPages memory book.`;
    document.title = title;
    descriptionMeta?.setAttribute('content', description);
    openGraphTitle?.setAttribute('content', title);
    openGraphDescription?.setAttribute('content', description);
    return () => {
      document.title = previousTitle;
      if (previousDescription)
        descriptionMeta?.setAttribute('content', previousDescription);
      if (previousOpenGraphTitle)
        openGraphTitle?.setAttribute('content', previousOpenGraphTitle);
      if (previousOpenGraphDescription)
        openGraphDescription?.setAttribute(
          'content',
          previousOpenGraphDescription,
        );
    };
  }, [book]);

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
  const graduation = profile.memory_book_mode === 'graduation';
  const promptText = new Map(prompts.map((prompt) => [prompt.id, prompt.text]));
  const orderedPrompts = graduation
    ? [...prompts].sort(
        (a, b) =>
          Number(b.category === 'graduation') -
          Number(a.category === 'graduation'),
      )
    : prompts;
  const isOwner =
    user?.user_metadata?.username?.toLowerCase() === profile.username;

  async function copyOwnerLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify('Memory book link copied');
    } catch {
      notify('Could not copy the link', 'error');
    }
  }

  async function refreshAfterSubmission(details) {
    setFormOpen(false);
    setSuccess({ ...details, refreshFailed: false });
    setRefreshingBook(true);
    try {
      const refreshedBook = await publicBookService.getBook(username);
      setBook(refreshedBook);
    } catch {
      setSuccess({ ...details, refreshFailed: true });
      notify(
        'Your memory was saved, but the updated book could not be loaded yet.',
        'error',
      );
    } finally {
      setRefreshingBook(false);
    }
  }

  async function returnToBook() {
    if (!success?.refreshFailed) {
      setSuccess(null);
      return;
    }

    setRefreshingBook(true);
    try {
      const refreshedBook = await publicBookService.getBook(username);
      setBook(refreshedBook);
      setSuccess(null);
    } catch {
      notify('The updated memory book still could not be loaded.', 'error');
    } finally {
      setRefreshingBook(false);
    }
  }

  if (success) {
    return (
      <div className="success-book" role="status">
        <div className="success-celebration" aria-hidden="true">
          <AutographDecoration motif="flower" />
          <span>♥</span>
          <AutographDecoration motif="sparkle" />
        </div>
        <p className="eyebrow">
          {graduation ? 'Farewell memory saved' : 'Memory saved'}
        </p>
        <h1>Your {graduation ? 'farewell ' : ''}memory has been added.</h1>
        <p>
          {graduation
            ? 'Thank you for being part of this chapter.'
            : success.hasPhoto
              ? 'Your message and photo are now part of this memory book.'
              : 'Thank you for leaving a little piece of your story behind.'}
        </p>
        <button
          className="primary-button"
          type="button"
          disabled={refreshingBook}
          onClick={returnToBook}
        >
          {refreshingBook
            ? 'Updating the memory book...'
            : success.refreshFailed
              ? 'Try loading the memory book again'
              : 'Back to the memory book'}
        </button>
      </div>
    );
  }

  return (
    <div className={`book-page${graduation ? ' graduation-book' : ''}`}>
      <div className="book-background-decor" aria-hidden="true">
        <AutographDecoration motif="leaf" />
        <AutographDecoration motif="sparkle" />
        <AutographDecoration motif="flower" />
      </div>
      <PublicBookHeader
        profile={profile}
        open={open}
        onLeaveMemory={() => setFormOpen(true)}
      />
      <section className="memory-list" aria-labelledby="memories-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Collected with care</p>
            <h2 id="memories-heading">Notes from lovely people</h2>
          </div>
          {memories.length > 0 && (
            <span className="memory-count">
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
            </span>
          )}
        </div>
        {memories.length ? (
          memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              prompt={promptText.get(memory.prompt_id)}
            />
          ))
        ) : (
          <div className="no-memories">
            <div className="empty-motifs" aria-hidden="true">
              <AutographDecoration motif="flower" />
              <span>♡</span>
              <AutographDecoration motif="sparkle" />
            </div>
            <h3>The first page is waiting</h3>
            <p>
              This memory book is ready for its first little note, shared story,
              or favorite moment.
            </p>
            {isOwner ? (
              <button
                className="primary-button"
                type="button"
                onClick={copyOwnerLink}
              >
                Copy your page link
              </button>
            ) : open ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => setFormOpen(true)}
              >
                Leave the first {graduation ? 'farewell ' : ''}memory
              </button>
            ) : null}
          </div>
        )}
      </section>
      {formOpen && (
        <MemoryForm
          username={profile.username}
          prompts={orderedPrompts}
          graduation={graduation}
          onClose={() => setFormOpen(false)}
          onSuccess={refreshAfterSubmission}
        />
      )}
    </div>
  );
}
