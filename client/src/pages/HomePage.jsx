import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Make it yours',
    description:
      'Create a page with your name, a short note, and a link that is easy to share.',
  },
  {
    number: '02',
    title: 'Pass the page around',
    description:
      'Send your link to the people who have been part of your story.',
  },
  {
    number: '03',
    title: 'Keep their words close',
    description: 'Friends can leave a memory without making an account.',
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-kicker">
            <span aria-hidden="true">✳</span> A little place for the people who
            matter
          </p>
          <h1 id="home-title">
            Memories worth <em>keeping.</em>
          </h1>
          <p className="home-intro">
            Some moments deserve more than a passing message. Make a page where
            friends can leave the stories, notes, and little things you&apos;ll
            want to read again.
          </p>
          <div className="home-actions">
            <Link className="home-button home-button-primary" to="/register">
              Start your page <span aria-hidden="true">↗</span>
            </Link>
            <a className="home-text-link" href="#how-it-works">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="home-reassurance">
            Free to start · Friends don&apos;t need an account
          </p>
        </div>

        <div
          className="home-preview"
          role="img"
          aria-label="Illustration of a personal memory book"
        >
          <div
            className="home-preview-orbit home-preview-orbit-one"
            aria-hidden="true"
          />
          <div
            className="home-preview-orbit home-preview-orbit-two"
            aria-hidden="true"
          />
          <div className="home-book">
            <div className="home-book-topline">
              <span>OurPages</span>
              <span>✦</span>
            </div>
            <div className="home-book-avatar" aria-hidden="true">
              J
            </div>
            <p className="home-book-label">A page for</p>
            <h2>
              Jamie&apos;s
              <br />
              memory book
            </h2>
            <p className="home-book-handle">@jamie</p>
            <div className="home-book-rule" />
            <p className="home-book-prompt">
              “What&apos;s a moment we&apos;ll always remember?”
            </p>
            <div className="home-book-note">
              <span className="home-note-mark" aria-hidden="true">
                “
              </span>
              <p>
                That rainy afternoon when we missed the train and found our
                favorite café instead.
              </p>
              <span className="home-note-author">— a friend</span>
            </div>
            <div className="home-book-bottom">
              <span>Little moments. Lasting words.</span>
              <span>01 / 03</span>
            </div>
          </div>
          <div className="home-sticker" aria-hidden="true">
            made with
            <br />
            <strong>love ♥</strong>
          </div>
        </div>
      </section>

      <section
        className="home-how"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="home-section-heading">
          <p className="home-kicker">Simple as passing a note</p>
          <h2 id="how-title">
            A home for the stories
            <br />
            you share.
          </h2>
          <p>
            Start a book, share your link, and let the people you love fill the
            pages.
          </p>
        </div>
        <div className="home-steps">
          {steps.map((step) => (
            <div className="home-step" key={step.number}>
              <span className="home-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-close" aria-labelledby="close-title">
        <span className="home-close-spark" aria-hidden="true">
          ✳
        </span>
        <p className="home-kicker">The good stuff stays</p>
        <h2 id="close-title">
          Give your memories
          <br />
          <em>a place to live.</em>
        </h2>
        <p>One page. All the words you&apos;ll come back to.</p>
        <Link className="home-button home-button-light" to="/register">
          Create your page <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <footer className="home-footer">
        <span>OurPages</span>
        <span>Made for remembering.</span>
      </footer>
    </div>
  );
}
