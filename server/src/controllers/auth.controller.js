import { getCurrentProfile } from '../services/profile.service.js';

export async function getCurrentUser(request, response) {
  const profile = await getCurrentProfile(request.user.id, request.supabase);
  response.json({
    data: { user: { id: request.user.id, email: request.user.email }, profile },
  });
}
