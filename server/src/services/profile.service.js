import { AppError } from '../utils/app-error.js';

const SAFE_PROFILE_FIELDS =
  'id, display_name, username, bio, avatar_url, memory_book_status, created_at, updated_at';

export async function getCurrentProfile(userId, database) {
  const { data, error } = await database
    .from('profiles')
    .select(SAFE_PROFILE_FIELDS)
    .eq('id', userId)
    .single();
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load profile');
  return data;
}

export async function updateCurrentProfile(userId, input, database) {
  const allowed = ['display_name', 'bio', 'avatar_url', 'memory_book_status'];
  const updates = Object.fromEntries(
    Object.entries(input ?? {}).filter(([key]) => allowed.includes(key)),
  );
  if (
    Object.keys(updates).length === 0 ||
    Object.keys(input ?? {}).some((key) => !allowed.includes(key))
  ) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'No supported profile fields were provided',
    );
  }
  if (updates.display_name != null) {
    updates.display_name =
      typeof updates.display_name === 'string'
        ? updates.display_name.trim()
        : '';
    if (!updates.display_name || updates.display_name.length > 100) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Display name must be between 1 and 100 characters',
      );
    }
  }
  if (
    updates.bio != null &&
    (typeof updates.bio !== 'string' || updates.bio.length > 500)
  ) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Bio must be at most 500 characters',
    );
  }
  if (
    updates.memory_book_status != null &&
    !['open', 'closed', 'private'].includes(updates.memory_book_status)
  ) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid memory book status');
  }

  const { data, error } = await database
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(SAFE_PROFILE_FIELDS)
    .single();
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not update profile');
  return data;
}
