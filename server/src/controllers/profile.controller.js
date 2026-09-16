import { updateCurrentProfile } from '../services/profile.service.js';

export async function patchCurrentProfile(request, response) {
  const profile = await updateCurrentProfile(
    request.user.id,
    request.body,
    request.supabase,
  );
  response.json({ data: profile });
}
