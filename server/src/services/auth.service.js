import crypto from 'node:crypto';
import { z } from 'zod';
import { GoogleProvider } from '../providers/google.provider.js';
import { SmtpProvider } from '../providers/smtp.provider.js';
import { env } from '../config/env.js';
import { createOtpEmail } from '../templates/email-otp.template.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '../utils/errors.js';
import { createOAuthState, consumeOAuthState } from '../utils/oauthState.js';
import {
  EMAIL_OTP_LENGTH,
  EMAIL_OTP_MAX_ATTEMPTS,
  EMAIL_OTP_TTL_MS,
  SESSION_TTL_MS,
} from '../config/constants.js';
import {
  consumeEmailOtpChallenge,
  createIdentity,
  createMembership,
  createEmailOtpChallenge,
  createSession,
  createWorkspace,
  findEmailOtpChallenge,
  findIdentity,
  findMembership,
  findValidSession,
  findFirstMembership,
  findUserByNormalizedEmail,
  findUserByNormalizedEmailInClient,
  incrementEmailOtpAttempts,
  invalidateEmailOtpChallenges,
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
  async requestEmailOtp(email) {
    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByNormalizedEmail(normalizedEmail);
    if (!user) {
      throw new NotFoundError('Account not found. Please sign up first.');
    }

    const code = generateEmailOtp();
    const now = new Date();

    await withTransaction(async (transaction) => {
      await invalidateEmailOtpChallenges(transaction, normalizedEmail, 'LOGIN', now);
      await createEmailOtpChallenge(transaction, {
        email: normalizedEmail,
        purpose: 'LOGIN',
        codeHash: hashOtp(code),
        expiresAt: new Date(now.getTime() + EMAIL_OTP_TTL_MS),
      });
    });

    await sendOtpEmail(normalizedEmail, code, 'sign-in');
  }

  async requestSignupOtp(displayName, email) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedDisplayName = displayName.trim();
    const existingUser = await findUserByNormalizedEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Account already exists. Please log in.');
    }

    const code = generateEmailOtp();
    const now = new Date();
    await withTransaction(async (transaction) => {
      await invalidateEmailOtpChallenges(transaction, normalizedEmail, 'SIGNUP', now);
      await createEmailOtpChallenge(transaction, {
        email: normalizedEmail,
        purpose: 'SIGNUP',
        displayName: normalizedDisplayName,
        codeHash: hashOtp(code),
        expiresAt: new Date(now.getTime() + EMAIL_OTP_TTL_MS),
      });
    });

    await sendOtpEmail(normalizedEmail, code, 'account creation');
  }

  async verifyEmailOtp(email, otp) {
    const normalizedEmail = normalizeEmail(email);
    const now = new Date();
    const result = await withTransaction(async (transaction) => {
      const challenge = await findEmailOtpChallenge(transaction, normalizedEmail, 'LOGIN', now);
      if (!challenge || challenge.attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
        return { valid: false };
      }

      if (!matchesOtp(otp, challenge.codeHash)) {
        await incrementEmailOtpAttempts(transaction, challenge.id);
        return { valid: false };
      }

      await consumeEmailOtpChallenge(transaction, challenge.id, now);
      const user = await findUserByNormalizedEmailInClient(transaction, normalizedEmail);
      if (!user) {
        return { valid: false };
      }
      const workspaceId = await ensureWorkspace(
        transaction,
        user.id,
        `${user.displayName}'s Workspace`
      );
      const rawToken = generateSessionToken();
      await createSession(transaction, {
        userId: user.id,
        workspaceId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });

      return { valid: true, user, workspaceId, rawToken };
    });

    if (!result.valid) {
      throw new UnauthorizedError('Invalid or expired email code');
    }

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

  async verifySignupOtp(email, otp) {
    const normalizedEmail = normalizeEmail(email);
    const now = new Date();
    const result = await withTransaction(async (transaction) => {
      const challenge = await findEmailOtpChallenge(transaction, normalizedEmail, 'SIGNUP', now);
      if (!challenge || challenge.attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
        return { valid: false };
      }

      if (!matchesOtp(otp, challenge.codeHash)) {
        await incrementEmailOtpAttempts(transaction, challenge.id);
        return { valid: false };
      }

      const existingUser = await findUserByNormalizedEmailInClient(transaction, normalizedEmail);
      if (existingUser) {
        return { valid: false, alreadyExists: true };
      }

      await consumeEmailOtpChallenge(transaction, challenge.id, now);
      const user = await upsertUser(transaction, {
        normalizedEmail,
        email: normalizedEmail,
        displayName: challenge.displayName,
        avatarUrl: null,
      });
      const workspaceId = await ensureWorkspace(
        transaction,
        user.id,
        `${user.displayName}'s Workspace`
      );
      const rawToken = generateSessionToken();
      await createSession(transaction, {
        userId: user.id,
        workspaceId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });

      return { valid: true, user, workspaceId, rawToken };
    });

    if (result.alreadyExists) {
      throw new ConflictError('Account already exists. Please log in.');
    }
    if (!result.valid) {
      throw new UnauthorizedError('Invalid or expired signup code');
    }

    return createAuthResult(result);
  }

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
      workspaceName: membership.workspace.name,
      workspaceRole: membership.role,
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

function generateEmailOtp() {
  return String(crypto.randomInt(0, 10 ** EMAIL_OTP_LENGTH)).padStart(EMAIL_OTP_LENGTH, '0');
}

function hashOtp(otp) {
  return crypto.createHmac('sha256', env.ENCRYPTION_SECRET).update(otp).digest('hex');
}

function matchesOtp(otp, codeHash) {
  const actual = Buffer.from(hashOtp(otp), 'hex');
  const expected = Buffer.from(codeHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendOtpEmail(email, code, purpose) {
  try {
    const message = createOtpEmail({ code, purpose });
    await SmtpProvider.sendEmail({
      to: email,
      ...message,
    });
  } catch {
    throw new ServiceUnavailableError('Email delivery is temporarily unavailable');
  }
}

function createAuthResult(result) {
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
