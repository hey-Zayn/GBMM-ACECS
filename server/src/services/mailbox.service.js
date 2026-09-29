import { GoogleProvider } from '../providers/google.provider.js';
import { SmtpProvider } from '../providers/smtp.provider.js';
import { encryptSecret } from '../utils/crypto.js';
import { BadRequestError, ForbiddenError } from '../utils/errors.js';
import { MAILBOX_TYPES, MAILBOX_STATUS } from '../config/constants.js';
import { createOAuthState, consumeOAuthState } from '../utils/oauthState.js';

export class MailboxService {
  async getConnectGoogleUrl(workspaceId, userId) {
    const state = await createOAuthState({
      intent: 'mailbox',
      workspaceId,
      userId,
    });

    return {
      url: GoogleProvider.getMailboxAuthUrl(state.nonce),
      browserChallenge: state.browserChallenge,
    };
  }

  async handleGoogleMailboxCallback(code, state, browserChallenge, authContext) {
    const stateData = await consumeMailboxState(state, browserChallenge, authContext);
    const tokens = await GoogleProvider.exchangeCode(code);
    if (!tokens.refresh_token || !tokens.access_token) {
      throw new BadRequestError('Google did not return the required mailbox tokens');
    }

    const profile = await GoogleProvider.getUserProfile(tokens.access_token);
    return {
      type: MAILBOX_TYPES.GMAIL_OAUTH,
      email: profile.email,
      workspaceId: stateData.workspaceId,
      status: MAILBOX_STATUS.ACTIVE,
      encryptedCredentials: encryptSecret(tokens.refresh_token),
      dailyCap: 500,
    };
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

    return {
      type: MAILBOX_TYPES.SMTP,
      email: smtpConfig.fromEmail,
      workspaceId,
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.user,
      encryptedCredentials: encryptSecret(smtpConfig.pass),
      dailyCap: smtpConfig.dailyCap || 500,
      status: MAILBOX_STATUS.ACTIVE,
    };
  }
}

export const mailboxService = new MailboxService();

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
