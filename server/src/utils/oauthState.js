import crypto from 'node:crypto';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

const OAUTH_STATE_PREFIX = 'auth:oauth-state:';
const OAUTH_STATE_TTL_SECONDS = 600;

export async function createOAuthState(options = {}) {
  const nonce = crypto.randomBytes(32).toString('hex');
  const state = `${nonce}.${signNonce(nonce)}`;
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
  return { nonce, state, browserChallenge };
}

export async function consumeOAuthState(state, browserChallenge) {
  const nonce = verifyStateSignature(state);
  if (!nonce) {
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

function signNonce(nonce) {
  return crypto.createHmac('sha256', env.ENCRYPTION_SECRET).update(nonce).digest('base64url');
}

function verifyStateSignature(state) {
  if (typeof state !== 'string') {
    return null;
  }

  const [nonce, signature] = state.split('.');
  if (!nonce || !signature || !/^[a-f0-9]{64}$/.test(nonce)) {
    return null;
  }

  const expected = signNonce(nonce);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  return nonce;
}
