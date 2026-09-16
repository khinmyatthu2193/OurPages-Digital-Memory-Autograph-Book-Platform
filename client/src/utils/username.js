export const RESERVED_USERNAMES = [
  'admin',
  'api',
  'login',
  'register',
  'dashboard',
  'settings',
  'help',
  'about',
  'auth',
  'account',
  'support',
  'privacy',
  'terms',
];

export function validateUsername(value) {
  const username = value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_]{2,29}$/.test(username)) {
    return {
      valid: false,
      error: 'Use 3-30 lowercase letters, numbers, or underscores.',
    };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'That username is reserved.' };
  }
  return { valid: true, value: username };
}
