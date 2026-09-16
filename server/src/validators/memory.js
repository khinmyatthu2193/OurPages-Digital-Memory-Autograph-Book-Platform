import { AppError } from '../utils/app-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateMemorySubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'A JSON request body is required',
    );
  }

  const allowed = new Set([
    'authorName',
    'message',
    'isAnonymous',
    'promptId',
    'website',
  ]);
  const unexpected = Object.keys(body).filter((key) => !allowed.has(key));
  if (unexpected.length) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Request contains unsupported fields',
      unexpected,
    );
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const isAnonymous = body.isAnonymous === true;
  const authorName =
    typeof body.authorName === 'string' ? body.authorName.trim() : '';

  if (!message || message.length > 5000) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Message must be between 1 and 5000 characters',
    );
  }
  if (!isAnonymous && (!authorName || authorName.length > 100)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Author name must be between 1 and 100 characters',
    );
  }
  if (
    body.promptId != null &&
    (typeof body.promptId !== 'string' || !UUID_PATTERN.test(body.promptId))
  ) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Prompt ID must be a UUID');
  }

  return {
    author_name: isAnonymous ? null : authorName,
    message,
    is_anonymous: isAnonymous,
    prompt_id: body.promptId ?? null,
  };
}
