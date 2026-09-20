import { describe, expect, it } from 'vitest';
import { validateMemorySubmission } from './memory.js';

describe('public memory validation', () => {
  it('normalizes a valid submission', () => {
    expect(
      validateMemorySubmission({
        authorName: ' May ',
        message: ' Hello ',
        isAnonymous: false,
      }),
    ).toEqual({
      author_name: 'May',
      message: 'Hello',
      is_anonymous: false,
      prompt_id: null,
    });
  });

  it('removes the author name from anonymous submissions', () => {
    expect(
      validateMemorySubmission({ message: 'Hello', isAnonymous: true })
        .author_name,
    ).toBeNull();
  });

  it('rejects unsupported fields', () => {
    expect(() =>
      validateMemorySubmission({
        authorName: 'May',
        message: 'Hello',
        ownerId: 'other',
      }),
    ).toThrow('unsupported fields');
  });

  it('rejects messages longer than the public 2,000 character limit', () => {
    expect(() =>
      validateMemorySubmission({ authorName: 'May', message: 'a'.repeat(2001) }),
    ).toThrow('between 1 and 2000');
  });
});
