import { describe, expect, it } from 'vitest';
import { validateUsername } from './username.js';

describe('username validation', () => {
  it('accepts a URL-safe username and normalizes case', () => {
    expect(validateUsername(' Khin_26 ')).toEqual({
      valid: true,
      value: 'khin_26',
    });
  });

  it.each(['xy', '_khin', 'khin-name', 'khin name'])(
    'rejects invalid username %s',
    (username) => {
      expect(validateUsername(username).valid).toBe(false);
    },
  );

  it.each(['admin', 'REGISTER', 'settings'])(
    'rejects reserved username %s',
    (username) => {
      expect(validateUsername(username).valid).toBe(false);
    },
  );
});
