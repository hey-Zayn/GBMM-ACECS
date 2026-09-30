import { redis } from '../config/redis.js';
import { AppError } from '../utils/errors.js';

export function rateLimit({ windowSec, max, keyPrefix }) {
  return async (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSec);
      }
      if (current > max) {
        const ttl = Math.max(await redis.ttl(key), 1);
        res.set('Retry-After', String(ttl));
        return next(new AppError('Too many requests', 429, 'RATE_LIMITED'));
      }
      return next();
    } catch (error) {
      console.error('[RateLimit] Redis unavailable:', error.message);
      return next(new AppError(
        'Authentication protection is temporarily unavailable',
        503,
        'SERVICE_UNAVAILABLE'
      ));
    }
  };
}

export const loginRateLimit = rateLimit({
  windowSec: 60,
  max: 10,
  keyPrefix: 'auth:login',
});

export const oauthCallbackRateLimit = rateLimit({
  windowSec: 60,
  max: 20,
  keyPrefix: 'auth:oauth-callback',
});

export const mailboxTestRateLimit = rateLimit({
  windowSec: 60,
  max: 10,
  keyPrefix: 'mailbox:test',
});

export const mailboxConnectRateLimit = rateLimit({
  windowSec: 60,
  max: 10,
  keyPrefix: 'mailbox:connect',
});

export const mailboxOAuthRateLimit = rateLimit({
  windowSec: 60,
  max: 20,
  keyPrefix: 'mailbox:oauth-callback',
});

export const logoutRateLimit = rateLimit({
  windowSec: 60,
  max: 20,
  keyPrefix: 'auth:logout',
});
