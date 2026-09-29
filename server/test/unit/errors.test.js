import { describe, expect, it } from 'vitest';
import { AppError, UnauthorizedError } from '../../src/utils/errors.js';

describe('application errors', () => {
  it('stores the status and stable error code', () => {
    const error = new UnauthorizedError('Authentication required');

    expect(error).toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  });

  it('uses the internal error defaults', () => {
    const error = new AppError('Unexpected failure');

    expect(error).toMatchObject({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    });
  });
});
