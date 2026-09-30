import { GoogleProvider } from '../providers/google.provider.js';
import { SmtpProvider } from '../providers/smtp.provider.js';
import { z } from 'zod';
import { decryptSecret, encryptSecret } from '../utils/crypto.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from '../utils/errors.js';
import { MAILBOX_TYPES, MAILBOX_STATUS } from '../config/constants.js';
import { env } from '../config/env.js';
import { createOAuthState, consumeOAuthState } from '../utils/oauthState.js';
import {
  createMailbox,
  findMailbox,
  findMailboxByEmail,
  findMailboxByProviderAccountId,
  listMailboxes,
  updateMailbox,
} from '../repositories/mailbox.repository.js';

export class MailboxService {
  discoverMailboxProvider(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split('@')[1];
    const provider = getSuggestedProvider(domain);
    const method = getRecommendedMethod(provider);

    return {
      email: normalizedEmail,
      suggestedProvider: provider,
      providerStatus: getProviderStatus(provider),
      availableMethods: getAvailableMethods(provider),
      recommendedMethod: method,
      connectEndpoint: getConnectEndpoint(method),
      connectionMode: getConnectionMode(method),
      requiresAdvancedSetup: method === 'SMTP',
    };
  }

  async getConnectGoogleUrl(workspaceId, userId) {
    const state = await createOAuthState({ intent: 'mailbox', workspaceId, userId });
    return {
      url: GoogleProvider.getMailboxAuthUrl(state.state || state.nonce),
      browserChallenge: state.browserChallenge,
    };
  }

  async handleGoogleMailboxCallback(code, state, browserChallenge, authContext, providerError) {
    const stateData = await consumeMailboxState(state, browserChallenge, authContext);
    if (providerError) {
      throw new BadRequestError('Google authorization was not completed');
    }
    let tokens;
    try {
      tokens = await GoogleProvider.exchangeCode(code, env.GOOGLE_MAILBOX_REDIRECT_URI);
    } catch {
      throw new ServiceUnavailableError('Google connection is temporarily unavailable');
    }
    const parsedTokens = googleTokenSchema.safeParse(tokens);
    if (!parsedTokens.success) {
      throw new BadRequestError('Google did not return the required mailbox tokens');
    }

    let profile;
    try {
      profile = await GoogleProvider.getUserProfile(parsedTokens.data.access_token);
    } catch {
      throw new ServiceUnavailableError('Google account verification is temporarily unavailable');
    }
    const parsedProfile = googleProfileSchema.safeParse(profile);
    if (!parsedProfile.success) {
      throw new BadRequestError('Google returned an unverified mailbox address');
    }
    return saveMailbox({
      type: MAILBOX_TYPES.GMAIL_OAUTH,
      email: parsedProfile.data.email.toLowerCase().trim(),
      displayName: parsedProfile.data.name,
      providerAccountId: parsedProfile.data.id,
      workspaceId: stateData.workspaceId,
      encryptedCredentials: encryptPayload({ refreshToken: parsedTokens.data.refresh_token }),
      lastVerifiedAt: new Date(),
    });
  }

  async connectSmtpMailbox(workspaceId, smtpConfig) {
    try {
      await SmtpProvider.verifyConnection({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      });
    } catch {
      throw new BadRequestError('SMTP connection test failed');
    }

    return saveMailbox({
      type: MAILBOX_TYPES.SMTP,
      email: smtpConfig.fromEmail,
      displayName: smtpConfig.fromName,
      workspaceId,
      encryptedCredentials: encryptPayload({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.user,
        pass: smtpConfig.pass,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName,
      }),
      dailyCap: smtpConfig.dailyCap,
      lastVerifiedAt: new Date(),
    });
  }

  async getWorkspaceMailboxes(workspaceId) {
    const mailboxes = await listMailboxes(workspaceId);
    return mailboxes.map(toSafeMailbox);
  }

  async disconnectMailbox(workspaceId, mailboxId) {
    const mailbox = await findMailbox(workspaceId, mailboxId);
    if (!mailbox) {
      throw new NotFoundError('Mailbox not found');
    }

    await updateMailbox(workspaceId, mailboxId, {
      status: MAILBOX_STATUS.DISCONNECTED,
      lastErrorCode: null,
    });
    return toSafeMailbox({ ...mailbox, status: MAILBOX_STATUS.DISCONNECTED, lastErrorCode: null });
  }

  async testMailboxConnection(workspaceId, mailboxId) {
    const mailbox = await findMailbox(workspaceId, mailboxId);
    if (!mailbox) {
      throw new NotFoundError('Mailbox not found');
    }
    if (mailbox.status === MAILBOX_STATUS.DISCONNECTED) {
      throw new BadRequestError('Mailbox is disconnected');
    }

    try {
      await verifyMailboxCredentials(mailbox);
    } catch (error) {
      const failure = classifyConnectionFailure(error);
      await updateMailbox(workspaceId, mailboxId, {
        status: failure.status,
        lastErrorCode: failure.code,
      });
      throw new BadRequestError('Mailbox connection test failed');
    }

    await updateMailbox(workspaceId, mailboxId, {
      status: MAILBOX_STATUS.ACTIVE,
      lastVerifiedAt: new Date(),
      lastErrorCode: null,
    });
    const updated = await findMailbox(workspaceId, mailboxId);
    return toSafeMailbox(updated);
  }
}

export const mailboxService = new MailboxService();

const GOOGLE_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const MICROSOFT_DOMAINS = new Set([
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'outlook.com',
  'outlook.co.uk',
]);

function getSuggestedProvider(domain) {
  if (GOOGLE_DOMAINS.has(domain)) {
    return 'GOOGLE';
  }
  if (MICROSOFT_DOMAINS.has(domain)) {
    return 'MICROSOFT';
  }
  return 'OTHER';
}

function getAvailableMethods(provider) {
  if (provider === 'GOOGLE') {
    return ['GOOGLE_OAUTH', 'SMTP'];
  }
  return ['SMTP'];
}

function getRecommendedMethod(provider) {
  return provider === 'GOOGLE' ? 'GOOGLE_OAUTH' : 'SMTP';
}

function getConnectEndpoint(method) {
  return method === 'GOOGLE_OAUTH' ? '/mailboxes/google/connect' : '/mailboxes/smtp';
}

function getConnectionMode(method) {
  return method === 'GOOGLE_OAUTH' ? 'OAUTH' : 'ADVANCED_SMTP';
}

function getProviderStatus(provider) {
  if (provider === 'GOOGLE') {
    return 'SUPPORTED';
  }
  if (provider === 'MICROSOFT') {
    return 'PLANNED';
  }
  return 'FALLBACK';
}

async function saveMailbox(data) {
  const existingByEmail = await findMailboxByEmail(data.workspaceId, data.email);
  const existingByProvider = data.providerAccountId
    ? await findMailboxByProviderAccountId(data.workspaceId, data.providerAccountId)
    : null;
  const existing = existingByEmail || existingByProvider;

  if (existing) {
    const { workspaceId: _workspaceId, ...mailboxData } = data;
    await updateMailbox(existing.workspaceId, existing.id, {
      ...mailboxData,
      status: MAILBOX_STATUS.ACTIVE,
      lastErrorCode: null,
    });
    const updated = await findMailbox(data.workspaceId, existing.id);
    return toSafeMailbox(updated);
  }

  const mailbox = await createMailbox({
    ...data,
    status: MAILBOX_STATUS.ACTIVE,
    sentTodayCount: 0,
    dailyCap: data.dailyCap || 500,
  });
  return toSafeMailbox(mailbox);
}

function toSafeMailbox(mailbox) {
  return {
    id: mailbox.id,
    workspaceId: mailbox.workspaceId,
    type: mailbox.type,
    email: mailbox.email,
    displayName: mailbox.displayName,
    status: mailbox.status,
    dailyCap: mailbox.dailyCap,
    sentTodayCount: mailbox.sentTodayCount,
    remainingToday: Math.max(mailbox.dailyCap - mailbox.sentTodayCount, 0),
    lastVerifiedAt: mailbox.lastVerifiedAt,
    lastErrorCode: mailbox.lastErrorCode,
    createdAt: mailbox.createdAt,
    updatedAt: mailbox.updatedAt,
  };
}

function encryptPayload(payload) {
  return encryptSecret(JSON.stringify(payload));
}

async function verifyMailboxCredentials(mailbox) {
  const credentials = parseCredentials(mailbox.encryptedCredentials, mailbox.type);
  if (mailbox.type === MAILBOX_TYPES.GMAIL_OAUTH) {
    const accessToken = await GoogleProvider.refreshAccessToken(credentials.refreshToken);
    const profile = await GoogleProvider.getUserProfile(accessToken);
    if (!profile.verifiedEmail || profile.email.toLowerCase().trim() !== mailbox.email) {
      throw new Error('Google mailbox identity mismatch');
    }
    return;
  }

  if (mailbox.type === MAILBOX_TYPES.SMTP) {
    await SmtpProvider.verifyConnection(credentials);
    return;
  }

  throw new Error('Unsupported mailbox type');
}

function parseCredentials(encryptedCredentials, type) {
  let credentials;
  try {
    credentials = JSON.parse(decryptSecret(encryptedCredentials));
  } catch {
    throw new Error('Invalid mailbox credentials');
  }

  const schema = type === MAILBOX_TYPES.GMAIL_OAUTH
    ? gmailCredentialsSchema
    : type === MAILBOX_TYPES.SMTP
      ? smtpCredentialsSchema
      : null;
  const parsed = schema?.safeParse(credentials);
  if (!parsed?.success) {
    throw new Error('Invalid mailbox credentials');
  }
  return parsed.data;
}

const googleTokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
});

const googleProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  verifiedEmail: z.literal(true),
  name: z.string().optional(),
});

const gmailCredentialsSchema = z.object({
  refreshToken: z.string().min(1),
});

const smtpCredentialsSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  user: z.string().min(1),
  pass: z.string().min(1),
});

function classifyConnectionFailure(error) {
  const providerStatus = error?.response?.status || error?.statusCode;
  const providerCode = String(error?.code || '').toUpperCase();
  const message = String(error?.message || '').toUpperCase();

  if (providerStatus === 429 || providerCode === 'EQUOTA' || message.includes('RATE LIMIT')) {
    return { status: MAILBOX_STATUS.RATE_LIMITED, code: 'PROVIDER_RATE_LIMITED' };
  }
  if (
    providerStatus === 401 ||
    providerStatus === 403 ||
    providerCode === 'EAUTH' ||
    message.includes('AUTH')
  ) {
    return { status: MAILBOX_STATUS.ERROR, code: 'PROVIDER_AUTH_FAILED' };
  }
  if (['ENOTFOUND', 'EAI_AGAIN'].includes(providerCode)) {
    return { status: MAILBOX_STATUS.ERROR, code: 'PROVIDER_HOST_UNREACHABLE' };
  }
  if (['ETIMEDOUT', 'ESOCKET'].includes(providerCode) || message.includes('TIMEOUT')) {
    return { status: MAILBOX_STATUS.ERROR, code: 'PROVIDER_TIMEOUT' };
  }
  return { status: MAILBOX_STATUS.ERROR, code: 'CONNECTION_TEST_FAILED' };
}

async function consumeMailboxState(state, browserChallenge, authContext) {
  let stateData;
  try {
    stateData = await consumeOAuthState(state, browserChallenge);
  } catch (error) {
    throw new BadRequestError(error.message);
  }

  if (
    stateData.intent !== 'mailbox' ||
    stateData.userId !== authContext.userId ||
    stateData.workspaceId !== authContext.workspaceId
  ) {
    throw new ForbiddenError('OAuth state does not match the authenticated workspace');
  }

  return stateData;
}
