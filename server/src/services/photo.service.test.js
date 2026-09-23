import { describe, expect, it, vi } from 'vitest';
import {
  createSignedPhotoUrls,
  MAX_PHOTO_BYTES,
  validatePhoto,
} from './photo.service.js';

const files = {
  jpeg: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  webp: Buffer.from('RIFF0000WEBP'),
};

describe('memory photo service', () => {
  it.each([
    ['image/jpeg', files.jpeg, 'jpg'],
    ['image/png', files.png, 'png'],
    ['image/webp', files.webp, 'webp'],
  ])('accepts a valid %s signature', (mimetype, buffer, extension) => {
    expect(validatePhoto({ mimetype, buffer, size: buffer.length })).toEqual({
      contentType: mimetype,
      extension,
    });
  });

  it('rejects unsupported and disguised files', () => {
    expect(() =>
      validatePhoto({
        mimetype: 'image/svg+xml',
        buffer: Buffer.from('<svg>'),
        size: 5,
      }),
    ).toThrow('JPG, PNG, or WebP');
    expect(() =>
      validatePhoto({
        mimetype: 'image/jpeg',
        buffer: Buffer.from('<script>'),
        size: 8,
      }),
    ).toThrow('JPG, PNG, or WebP');
  });

  it('rejects files larger than 5 MB', () => {
    expect(() =>
      validatePhoto({
        mimetype: 'image/jpeg',
        buffer: files.jpeg,
        size: MAX_PHOTO_BYTES + 1,
      }),
    ).toThrow('smaller than 5 MB');
  });

  it('replaces private paths with short-lived signed URLs', async () => {
    const createSignedUrls = vi.fn(async () => ({
      data: [{ path: 'owner/memory/photo.jpg', signedUrl: 'https://signed' }],
      error: null,
    }));
    const storage = { from: vi.fn(() => ({ createSignedUrls })) };
    const result = await createSignedPhotoUrls(
      [{ id: 'memory', photo_path: 'owner/memory/photo.jpg' }],
      storage,
    );
    expect(result).toEqual([{ id: 'memory', photo_url: 'https://signed' }]);
    expect(result[0]).not.toHaveProperty('photo_path');
    expect(createSignedUrls).toHaveBeenCalledWith(
      ['owner/memory/photo.jpg'],
      600,
    );
  });
});
