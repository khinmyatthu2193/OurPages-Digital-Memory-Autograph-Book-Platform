import {
  getSupabaseAdmin,
  getSupabasePublicClient,
} from '../config/supabase.js';
import { AppError } from '../utils/app-error.js';
import { validateMemorySubmission } from '../validators/memory.js';
import { validateUsername } from '../validators/username.js';

export async function getPublicBook(
  rawUsername,
  database = getSupabasePublicClient(),
) {
  const result = validateUsername(rawUsername);
  if (!result.valid)
    throw new AppError(404, 'BOOK_NOT_FOUND', 'Memory book not found');

  const { data: profile, error } = await database
    .from('profiles')
    .select('id, display_name, username, bio, avatar_url, memory_book_status')
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
  return { profile, prompts };
}

export async function createPublicMemory(
  rawUsername,
  body,
  database = getSupabaseAdmin(),
) {
  const result = validateUsername(rawUsername);
  if (!result.valid)
    throw new AppError(404, 'BOOK_NOT_FOUND', 'Memory book not found');
  if (typeof body?.website === 'string' && body.website.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Submission rejected');
  }
  const memory = validateMemorySubmission(body);
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

  const { data, error } = await database
    .from('memories')
    .insert({ ...memory, owner_id: owner.id })
    .select('id, created_at')
    .single();
  if (error) throw new AppError(500, 'DATABASE_ERROR', 'Could not save memory');
  return data;
}
