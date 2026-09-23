import { AppError } from '../utils/app-error.js';

import { getSupabaseAdmin } from '../config/supabase.js';
import { createSignedPhotoUrls, removeStoredPhoto } from './photo.service.js';

const MEMORY_FIELDS =
  'id, author_name, message, is_anonymous, prompt_id, photo_path, is_favorite, is_pinned, is_hidden, created_at, updated_at';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MUTABLE_FIELDS = new Set(['is_favorite', 'is_pinned', 'is_hidden']);

function validateMemoryId(memoryId) {
  if (!UUID_PATTERN.test(memoryId ?? '')) {
    throw new AppError(404, 'MEMORY_NOT_FOUND', 'Memory not found');
  }
}

function validateUpdates(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'A JSON request body is required',
    );
  }
  const entries = Object.entries(input);
  if (
    entries.length === 0 ||
    entries.some(
      ([key, value]) => !MUTABLE_FIELDS.has(key) || typeof value !== 'boolean',
    )
  ) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Only boolean favorite, pinned, or hidden fields can be updated',
    );
  }
  return Object.fromEntries(entries);
}

export async function listOwnedMemories(userId, database, storage) {
  const { data, error } = await database
    .from('memories')
    .select(MEMORY_FIELDS)
    .eq('owner_id', userId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load memories');
  const photoStorage = data.some((memory) => memory.photo_path)
    ? (storage ?? getSupabaseAdmin().storage)
    : storage;
  return createSignedPhotoUrls(data, photoStorage);
}

export async function updateOwnedMemory(
  userId,
  memoryId,
  input,
  database,
  storage,
) {
  validateMemoryId(memoryId);
  const updates = validateUpdates(input);
  const { data, error } = await database
    .from('memories')
    .update(updates)
    .eq('id', memoryId)
    .eq('owner_id', userId)
    .select(MEMORY_FIELDS)
    .maybeSingle();
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not update memory');
  if (!data) throw new AppError(404, 'MEMORY_NOT_FOUND', 'Memory not found');
  const photoStorage = data.photo_path
    ? (storage ?? getSupabaseAdmin().storage)
    : storage;
  return (await createSignedPhotoUrls([data], photoStorage))[0];
}

export async function deleteOwnedMemory(userId, memoryId, database, storage) {
  validateMemoryId(memoryId);
  const { data, error } = await database
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('owner_id', userId)
    .select('id, photo_path')
    .maybeSingle();
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not delete memory');
  if (!data) throw new AppError(404, 'MEMORY_NOT_FOUND', 'Memory not found');
  let photo_cleanup_failed = false;
  if (data.photo_path) {
    photo_cleanup_failed = await removeStoredPhoto(
      storage ?? getSupabaseAdmin().storage,
      data.photo_path,
    );
  }
  return { id: data.id, photo_cleanup_failed };
}
