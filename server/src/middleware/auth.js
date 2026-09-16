import { getSupabaseAuthClient } from '../config/supabase.js';
import { AppError } from '../utils/app-error.js';

export async function requireAuth(request, _response, next) {
  try {
    const authorization = request.get('authorization') ?? '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AppError(
        401,
        'UNAUTHENTICATED',
        'A valid access token is required',
      );
    }

    const client = getSupabaseAuthClient(token);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      throw new AppError(
        401,
        'UNAUTHENTICATED',
        'A valid access token is required',
      );
    }
    request.user = data.user;
    request.supabase = client;
    next();
  } catch (error) {
    next(error);
  }
}
