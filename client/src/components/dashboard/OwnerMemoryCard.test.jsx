import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OwnerMemoryCard from './OwnerMemoryCard.jsx';

describe('owner memory card photos', () => {
  it('shows a lazy thumbnail for an owned photo memory', () => {
    render(
      <OwnerMemoryCard
        memory={{
          id: 'memory-1',
          author_name: 'May',
          is_anonymous: false,
          message: 'A photo memory',
          photo_url: 'https://example.test/signed-photo.jpg',
          created_at: '2026-09-20T00:00:00Z',
          is_pinned: false,
          is_favorite: false,
          is_hidden: true,
        }}
      />,
    );
    expect(
      screen.getByAltText("Photo attached to May's memory"),
    ).toHaveAttribute('loading', 'lazy');
    expect(
      screen.getByText('Only you can see this memory.'),
    ).toBeInTheDocument();
  });
});
