import multer from 'multer';
import { MAX_PHOTO_BYTES } from '../services/photo.service.js';
import { AppError } from '../utils/app-error.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 8, parts: 9 },
});

export function parseMemoryPhoto(request, response, next) {
  upload.single('photo')(request, response, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'Please choose a photo smaller than 5 MB.'
          : 'Only one photo can be attached to a memory.';
      return next(new AppError(400, 'INVALID_PHOTO', message));
    }
    return next(
      new AppError(400, 'INVALID_PHOTO', 'The photo could not be uploaded.'),
    );
  });
}
