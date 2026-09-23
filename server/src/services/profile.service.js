import { AppError } from '../utils/app-error.js';

const SAFE_PROFILE_FIELDS =
  'id, display_name, username, bio, avatar_url, memory_book_status, memory_book_mode, graduation_title, graduation_class, graduation_year, graduation_message, created_at, updated_at';

const OPTIONAL_TEXT_FIELDS = {
  graduation_title: 120,
  graduation_class: 120,
  graduation_message: 600,
};

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
  const allowed = [
    'display_name',
    'bio',
    'avatar_url',
    'memory_book_status',
    'memory_book_mode',
    'graduation_title',
    'graduation_class',
    'graduation_year',
    'graduation_message',
  ];
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
  if (
    updates.memory_book_mode != null &&
    !['standard', 'graduation'].includes(updates.memory_book_mode)
  ) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid memory book mode');
  }
  for (const [field, limit] of Object.entries(OPTIONAL_TEXT_FIELDS)) {
    if (updates[field] == null) continue;
    if (typeof updates[field] !== 'string') {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Graduation details must be text',
      );
    }
    const value = updates[field].trim();
    if (value.length > limit) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `Graduation details must be at most ${limit} characters`,
      );
    }
    updates[field] = value || null;
  }
  if (
    updates.graduation_year !== undefined &&
    updates.graduation_year !== null &&
    (!Number.isInteger(updates.graduation_year) ||
      updates.graduation_year < 1900 ||
      updates.graduation_year > 2200)
  ) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Graduation year must be between 1900 and 2200',
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
