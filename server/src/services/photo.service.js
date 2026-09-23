import { AppError } from '../utils/app-error.js';

export const PHOTO_BUCKET = 'memory-photos';
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_URL_TTL_SECONDS = 10 * 60;

const PHOTO_TYPES = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (buffer) =>
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'image/webp': {
    extension: 'webp',
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP',
  },
};

export function validatePhoto(file) {
  if (!file) return null;
  if (!file.buffer || file.size < 1 || file.size > MAX_PHOTO_BYTES) {
    throw new AppError(
      400,
      'INVALID_PHOTO',
      'Please choose a photo smaller than 5 MB.',
    );
  }
  const type = PHOTO_TYPES[file.mimetype];
  if (!type || !type.matches(file.buffer)) {
    throw new AppError(
      400,
      'INVALID_PHOTO',
      'Please choose a valid JPG, PNG, or WebP image.',
    );
  }
  return { contentType: file.mimetype, extension: type.extension };
}

export async function createSignedPhotoUrls(memories, storage) {
  const paths = memories.map((memory) => memory.photo_path).filter(Boolean);
  if (!paths.length) {
    return memories.map(({ photo_path: _photoPath, ...memory }) => memory);
  }
  const { data, error } = await storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, PHOTO_URL_TTL_SECONDS);
  if (error) {
    throw new AppError(500, 'STORAGE_ERROR', 'Could not load memory photos');
  }
  const urls = new Map(data.map((item) => [item.path, item.signedUrl]));
  return memories.map(({ photo_path: photoPath, ...memory }) => ({
    ...memory,
    ...(photoPath && urls.get(photoPath)
      ? { photo_url: urls.get(photoPath) }
      : {}),
  }));
}

export async function removeStoredPhoto(storage, path) {
  if (!path) return false;
  try {
    const { error } = await storage.from(PHOTO_BUCKET).remove([path]);
    return Boolean(error);
  } catch {
    return true;
  }
}
