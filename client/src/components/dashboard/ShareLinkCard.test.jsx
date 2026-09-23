import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShareLinkCard from './ShareLinkCard.jsx';

const toDataURL = vi.hoisted(() => vi.fn());
vi.mock('qrcode', () => ({ default: { toDataURL } }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('memory book sharing', () => {
  it('copies the exact public URL and hides unsupported native sharing', async () => {
    const writeText = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<ShareLinkCard username="khin" displayName="Khin" />);
    expect(
      screen.queryByRole('button', { name: 'Share' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('http://localhost:3000/u/khin'),
    );
  });

  it('generates a downloadable QR containing only the public URL', async () => {
    toDataURL.mockResolvedValue('data:image/png;base64,qr');
    render(
      <ShareLinkCard username="khin" displayName="Khin" mode="graduation" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'QR code' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() =>
      expect(toDataURL).toHaveBeenCalledWith(
        'http://localhost:3000/u/khin',
        expect.any(Object),
      ),
    );
    expect(
      await screen.findByRole('link', { name: 'Download QR' }),
    ).toHaveAttribute('download', 'ourpages-khin-qr.png');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses occasion-aware native share data when supported', async () => {
    const share = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { share, clipboard: { writeText: vi.fn() } });
    render(
      <ShareLinkCard username="khin" displayName="Khin" mode="graduation" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: "Khin's Farewell Memory Book",
        text: 'Leave a farewell memory for Khin on OurPages.',
        url: 'http://localhost:3000/u/khin',
      }),
    );
  });
});
