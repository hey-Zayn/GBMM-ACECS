import crypto from 'node:crypto';
import { z } from 'zod';
import { GoogleProvider } from '../providers/google.provider.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors.js';
import { createOAuthState, consumeOAuthState } from '../utils/oauthState.js';
import { SESSION_TTL_MS } from '../config/constants.js';
import {
  createIdentity,
  createMembership,
  createSession,
  createWorkspace,
  findIdentity,
  findMembership,
  findValidSession,
  findFirstMembership,
  revokeSession as revokeSessionRecord,
  touchSession,
  upsertUser,
  withTransaction,
} from '../repositories/auth.repository.js';

const googleProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  verifiedEmail: z.literal(true),
  name: z.string().optional(),
  picture: z.string().url().optional(),
});

export class AuthService {
  async getGoogleLoginUrl() {
    const state = await createOAuthState({ intent: 'login' });
    return {
      url: GoogleProvider.getUserAuthUrl(state.nonce),
      browserChallenge: state.browserChallenge,
    };
  }

  async processGoogleLogin(code, state, browserChallenge) {
    const stateData = await consumeLoginState(state, browserChallenge);
    if (stateData.intent !== 'login') {
      throw new BadRequestError('Invalid OAuth login state');
    }

    const tokens = await GoogleProvider.exchangeCode(code);
    if (!tokens.access_token) {
      throw new UnauthorizedError('Failed to obtain Google access token');
    }

    let profile;
    try {
      profile = googleProfileSchema.parse(await GoogleProvider.getUserProfile(tokens.access_token));
    } catch {
      throw new UnauthorizedError('Invalid Google account profile');
    }
    const normalizedEmail = profile.email.toLowerCase().trim();
    const result = await withTransaction(async (transaction) => {
      const user = await upsertUser(transaction, {
        normalizedEmail,
        email: profile.email,
        displayName: profile.name || normalizedEmail,
        avatarUrl: profile.picture || null,
      });

      await ensureGoogleIdentity(transaction, user.id, profile);
      const workspaceId = await ensureWorkspace(transaction, user.id, `${user.displayName}'s Workspace`);
      const rawToken = generateSessionToken();
      await createSession(transaction, {
        userId: user.id,
        workspaceId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });

      return { user, workspaceId, rawToken };
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatarUrl: result.user.avatarUrl,
        workspaceId: result.workspaceId,
      },
      sessionToken: result.rawToken,
    };
  }

  async verifyAndTouchSession(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthorizedError('Authentication required');
    }

    const tokenHash = hashToken(rawToken);
    const session = await findValidSession(tokenHash);
    if (!session) {
      throw new UnauthorizedError('Session is invalid, expired, or revoked');
    }

    const membership = await findMembership(session.userId, session.workspaceId);
    if (!membership) {
      throw new UnauthorizedError('Session workspace access is invalid');
    }

    await touchSession(tokenHash);
    return {
      userId: session.userId,
      workspaceId: session.workspaceId,
      email: session.user.email,
      sessionId: session.id,
      displayName: session.user.displayName,
      avatarUrl: session.user.avatarUrl,
    };
  }

  async revokeSession(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      return;
    }
    await revokeSessionRecord(hashToken(rawToken));
  }
}

export const authService = new AuthService();

async function consumeLoginState(state, browserChallenge) {
  try {
    return await consumeOAuthState(state, browserChallenge);
  } catch (error) {
    throw new BadRequestError(error.message);
  }
}

async function ensureGoogleIdentity(transaction, userId, profile) {
  const existing = await findIdentity(transaction, 'GOOGLE', profile.id);
  if (existing && existing.userId !== userId) {
    throw new ConflictError('Google account is already linked to another user');
  }
  if (existing) {
    return existing;
  }

  try {
    return await createIdentity(transaction, {
      userId,
      provider: 'GOOGLE',
      providerAccountId: profile.id,
      providerEmail: profile.email,
    });
  } catch (error) {
    if (error.code !== 'P2002') {
      throw error;
    }
    const concurrentIdentity = await findIdentity(transaction, 'GOOGLE', profile.id);
    if (!concurrentIdentity || concurrentIdentity.userId !== userId) {
      throw new ConflictError('Google account is already linked to another user');
    }
    return concurrentIdentity;
  }
}

async function ensureWorkspace(transaction, userId, name) {
  const membership = await findFirstMembership(transaction, userId);
  if (membership) {
    return membership.workspaceId;
  }

  const workspace = await createWorkspace(transaction, name);
  await createMembership(transaction, {
    workspaceId: workspace.id,
    userId,
    role: 'OWNER',
  });
  return workspace.id;
}

function generateSessionToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
