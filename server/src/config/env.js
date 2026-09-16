import 'dotenv/config';

function readPort(value) {
  const port = Number(value ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  return port;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const env = Object.freeze({
  nodeEnv,
  port: readPort(process.env.PORT),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  isProduction: nodeEnv === 'production',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
