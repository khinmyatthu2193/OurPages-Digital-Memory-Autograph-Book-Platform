import { getSupabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/app-error.js';
import { createSignedPhotoUrls } from './photo.service.js';

const EXPORT_PROFILE_FIELDS =
  'display_name, username, bio, avatar_url, memory_book_mode, graduation_title, graduation_class, graduation_year, graduation_message';
const EXPORT_MEMORY_FIELDS =
  'author_name, message, is_anonymous, prompt_id, photo_path, created_at';

export async function getOwnedExportBook(
  userId,
  database,
  storage = getSupabaseAdmin().storage,
) {
  const { data: profile, error: profileError } = await database
    .from('profiles')
    .select(EXPORT_PROFILE_FIELDS)
    .eq('id', userId)
    .single();
  if (profileError || !profile) {
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load export profile');
  }

  const { data: prompts, error: promptError } = await database
    .from('prompts')
    .select('id, text')
    .eq('is_active', true);
  if (promptError) {
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load export prompts');
  }

  const { data: memories, error: memoryError } = await database
    .from('memories')
    .select(EXPORT_MEMORY_FIELDS)
    .eq('owner_id', userId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });
  if (memoryError) {
    throw new AppError(500, 'DATABASE_ERROR', 'Could not load export memories');
  }

  let memoriesWithPhotos;
  try {
    memoriesWithPhotos = await createSignedPhotoUrls(memories, storage);
  } catch {
    // A storage outage should not make the owner's text memories impossible to
    // preserve. Photo paths are still stripped by the same signing helper.
    memoriesWithPhotos = memories.map(
      ({ photo_path: _path, ...memory }) => memory,
    );
  }
  const promptText = new Map(prompts.map((prompt) => [prompt.id, prompt.text]));

  return {
    profile,
    memories: memoriesWithPhotos.map(({ prompt_id: promptId, ...memory }) => ({
      ...memory,
      ...(promptText.has(promptId) ? { prompt: promptText.get(promptId) } : {}),
    })),
  };
}
