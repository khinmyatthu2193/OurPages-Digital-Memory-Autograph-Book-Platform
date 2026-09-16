import { describe, expect, it } from 'vitest';
import { validateUsername } from './username.js';

describe('username validation', () => {
  it('accepts and normalizes a valid username', () => {
    expect(validateUsername('  Khin_2026 ')).toEqual({
      valid: true,
      value: 'khin_2026',
    });
  });

  it.each(['ab', '_starts_wrong', 'has-dash', 'has space'])(
    'rejects invalid username %s',
    (username) => {
      expect(validateUsername(username).valid).toBe(false);
    },
  );

  it.each(['admin', 'API', ' dashboard '])(
    'rejects reserved username %s',
    (username) => {
      expect(validateUsername(username)).toMatchObject({
        valid: false,
        error: 'That username is reserved.',
      });
    },
  );
});
