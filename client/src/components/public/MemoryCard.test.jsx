import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MemoryCard from './MemoryCard.jsx';

describe('public memory card', () => {
  it('keeps long memories available through an accessible expansion', () => {
    const message = 'A memory '.repeat(70);
    render(
      <MemoryCard
        memory={{
          author_name: 'May',
          is_anonymous: false,
          message,
          created_at: '2026-09-20T00:00:00Z',
        }}
        prompt="What will you always remember?"
      />,
    );
    expect(screen.getByText(/In response to/)).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Read more' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(document.querySelector('.screen-message')).toHaveTextContent(
      message,
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens and closes an attached photo in an accessible viewer', () => {
    render(
      <MemoryCard
        memory={{
          author_name: 'May',
          is_anonymous: false,
          message: 'A photo memory',
          photo_url: 'https://example.test/signed-photo.jpg',
          created_at: '2026-09-20T00:00:00Z',
        }}
      />,
    );
    const thumbnail = screen.getByRole('button', {
      name: /view photo attached to may's memory/i,
    });
    expect(
      screen.getByAltText("Photo attached to May's memory"),
    ).toHaveAttribute('loading', 'lazy');
    fireEvent.click(thumbnail);
    const dialog = screen.getByRole('dialog', { name: 'Memory photo viewer' });
    expect(dialog).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
