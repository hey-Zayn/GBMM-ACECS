import crypto from 'node:crypto';
import { redis } from '../config/redis.js';

const OAUTH_STATE_PREFIX = 'auth:oauth-state:';
const OAUTH_STATE_TTL_SECONDS = 600;

export async function createOAuthState(options = {}) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const browserChallenge = crypto.randomBytes(32).toString('base64url');
  const key = `${OAUTH_STATE_PREFIX}${nonce}`;
  const payload = JSON.stringify({
    intent: options.intent || 'login',
    userId: options.userId || null,
    workspaceId: options.workspaceId || null,
    browserChallengeHash: hashValue(browserChallenge),
    createdAt: Date.now(),
  });

  await redis.set(key, payload, 'EX', OAUTH_STATE_TTL_SECONDS);
  return { nonce, browserChallenge };
}

export async function consumeOAuthState(nonce, browserChallenge) {
  if (!nonce || typeof nonce !== 'string') {
    throw new Error('Invalid OAuth state: missing nonce');
  }
  if (!browserChallenge || typeof browserChallenge !== 'string') {
    throw new Error('Invalid OAuth state: missing browser challenge');
  }

  const key = `${OAUTH_STATE_PREFIX}${nonce}`;
  const stored = await redis.eval(
    "local value = redis.call('GET', KEYS[1]); if not value then return false end; local expected = cjson.decode(value).browserChallengeHash; if expected ~= ARGV[1] then return false end; redis.call('DEL', KEYS[1]); return value",
    1,
    key,
    hashValue(browserChallenge)
  );
  if (!stored) {
    throw new Error('Invalid, expired, or already-used OAuth state');
  }

  const parsed = JSON.parse(stored);
  return parsed;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
