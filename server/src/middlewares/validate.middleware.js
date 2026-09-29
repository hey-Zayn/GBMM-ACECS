import { BadRequestError } from '../utils/errors.js';

/**
 * Higher-order middleware to validate request data using a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new BadRequestError('Validation failed', formattedErrors));
    }

    req[source] = result.data;
    next();
  };
}
