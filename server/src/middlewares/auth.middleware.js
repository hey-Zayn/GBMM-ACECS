import { authService } from '../services/auth.service.js';
import { AUTH_COOKIE_NAME } from '../config/constants.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const sessionData = await authService.verifyAndTouchSession(token);
    req.user = sessionData;
    next();
  } catch (err) {
    next(err);
  }
}
