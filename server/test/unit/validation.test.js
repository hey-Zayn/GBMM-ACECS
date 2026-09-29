import { describe, expect, it } from 'vitest';
import { googleCallbackQuerySchema } from '../../src/schemas/auth.schema.js';

describe('authentication validation', () => {
  it('accepts a valid Google callback query', () => {
    const result = googleCallbackQuerySchema.safeParse({
      code: 'authorization-code',
      state: 'oauth-state',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a callback without code or state', () => {
    const result = googleCallbackQuerySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
