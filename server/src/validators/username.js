export const RESERVED_USERNAMES = Object.freeze([
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
]);

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_]{2,29}$/;

export function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateUsername(value) {
  const username = normalizeUsername(value);
  if (!USERNAME_PATTERN.test(username)) {
    return {
      valid: false,
      error:
        'Use 3-30 lowercase letters, numbers, or underscores; start with a letter or number.',
    };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'That username is reserved.' };
  }
  return { valid: true, value: username };
}
