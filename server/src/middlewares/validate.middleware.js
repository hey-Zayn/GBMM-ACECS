import { BadRequestError } from '../utils/errors.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const formattedErrors = issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new BadRequestError('Validation failed', formattedErrors));
    }

    if (source === 'query' || source === 'params') {
      Object.assign(req[source], result.data);
    } else {
      req[source] = result.data;
    }
    next();
  };
}
