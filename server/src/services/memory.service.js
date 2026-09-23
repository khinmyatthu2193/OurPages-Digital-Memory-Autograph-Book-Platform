import {
  getSupabaseAdmin,
  getSupabasePublicClient,
} from '../config/supabase.js';
import { randomUUID } from 'node:crypto';
import { AppError } from '../utils/app-error.js';
import { validateMemorySubmission } from '../validators/memory.js';
import { validateUsername } from '../validators/username.js';
import {
  createSignedPhotoUrls,
  PHOTO_BUCKET,
  removeStoredPhoto,
  validatePhoto,
} from './photo.service.js';

export async function getPublicBook(
  rawUsername,
  database = getSupabaseAdmin(),
) {
  const result = validateUsername(rawUsername);
  if (!result.valid)
    throw new AppError(404, 'BOOK_NOT_FOUND', 'Memory book not found');

  const { data: profile, error } = await database
    .from('profiles')
    .select(
      'id, display_name, username, bio, avatar_url, memory_book_status, memory_book_mode, graduation_title, graduation_class, graduation_year, graduation_message',
    )
    .eq('username', result.value)
    .neq('memory_book_status', 'private')
    .maybeSingle();
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load memory book');
  if (!profile)
    throw new AppError(404, 'BOOK_NOT_FOUND', 'Memory book not found');

  const { data: prompts, error: promptError } = await database
    .from('prompts')
    .select('id, text, category')
    .eq('is_active', true)
    .order('category');
  if (promptError)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load prompts');
  const { data: memories, error: memoryError } = await database
    .from('memories')
    .select(
      'id, author_name, message, is_anonymous, prompt_id, photo_path, created_at',
    )
    .eq('owner_id', profile.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });
  if (memoryError)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load memories');
  const publicProfile = { ...profile };
  delete publicProfile.id;
  const publicMemories = await createSignedPhotoUrls(
    memories,
    database.storage,
  );
  return { profile: publicProfile, prompts, memories: publicMemories };
}

export async function getActivePrompts(database = getSupabasePublicClient()) {
  const { data, error } = await database
    .from('prompts')
    .select('id, text, category')
    .eq('is_active', true)
    .order('category');
  if (error)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load prompts');
  return data;
}

export async function createPublicMemory(
  rawUsername,
  body,
  database = getSupabaseAdmin(),
  photo,
  storage = database.storage,
) {
  const result = validateUsername(rawUsername);
  if (!result.valid)
    throw new AppError(404, 'BOOK_NOT_FOUND', 'Memory book not found');
  if (typeof body?.website === 'string' && body.website.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Submission rejected');
  }
  const memory = validateMemorySubmission(body);
  const photoType = validatePhoto(photo);
  const { data: owner, error: ownerError } = await database
    .from('profiles')
    .select('id')
    .eq('username', result.value)
    .eq('memory_book_status', 'open')
    .maybeSingle();
  if (ownerError)
    throw new AppError(500, 'DATABASE_ERROR', 'Could not verify memory book');
  if (!owner)
    throw new AppError(
      404,
      'BOOK_NOT_OPEN',
      'Memory book is not available for submissions',
    );

  if (memory.prompt_id) {
    const { data: prompt, error: promptError } = await database
      .from('prompts')
      .select('id')
      .eq('id', memory.prompt_id)
      .eq('is_active', true)
      .maybeSingle();
    if (promptError)
      throw new AppError(500, 'DATABASE_ERROR', 'Could not verify prompt');
    if (!prompt)
      throw new AppError(400, 'INVALID_PROMPT', 'Prompt is not active');
  }

  const memoryId = randomUUID();
  let photoPath = null;
  if (photoType) {
    photoPath = `${owner.id}/${memoryId}/${randomUUID()}.${photoType.extension}`;
    let uploadError;
    try {
      ({ error: uploadError } = await storage
        .from(PHOTO_BUCKET)
        .upload(photoPath, photo.buffer, {
          contentType: photoType.contentType,
          cacheControl: '3600',
          upsert: false,
        }));
    } catch {
      uploadError = true;
    }
    if (uploadError) {
      throw new AppError(
        502,
        'PHOTO_UPLOAD_FAILED',
        "We couldn't upload your photo. Your memory was not submitted.",
      );
    }
  }

  const { data, error } = await database
    .from('memories')
    .insert({
      id: memoryId,
      ...memory,
      owner_id: owner.id,
      photo_path: photoPath,
    })
    .select('id, created_at')
    .single();
  if (error) {
    await removeStoredPhoto(storage, photoPath);
    if (error.code === '23505' && memory.submission_token) {
      const { data: existing, error: existingError } = await database
        .from('memories')
        .select('id, created_at')
        .eq('owner_id', owner.id)
        .eq('submission_token', memory.submission_token)
        .maybeSingle();
      if (!existingError && existing) return existing;
    }
    throw new AppError(500, 'DATABASE_ERROR', 'Could not save memory');
  }
  return data;
}
