import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

function requireValue(value, name) {
  if (!value) {
    const error = new Error(`${name} is required for this operation`);
    error.code = 'SERVER_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }
  return value;
}

const options = {
  auth: { autoRefreshToken: false, persistSession: false },
};

export function getSupabaseAdmin() {
  return createClient(
    requireValue(env.supabaseUrl, 'SUPABASE_URL'),
    requireValue(env.supabaseServiceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY'),
    options,
  );
}

export function getSupabasePublicClient() {
  return createClient(
    requireValue(env.supabaseUrl, 'SUPABASE_URL'),
    requireValue(env.supabaseAnonKey, 'SUPABASE_ANON_KEY'),
    options,
  );
}

export function getSupabaseAuthClient(accessToken) {
  return createClient(
    requireValue(env.supabaseUrl, 'SUPABASE_URL'),
    requireValue(env.supabaseAnonKey, 'SUPABASE_ANON_KEY'),
    {
      ...options,
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    },
  );
}
