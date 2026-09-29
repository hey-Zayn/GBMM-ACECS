import { GoogleProvider } from '../providers/google.provider.js';
import { SmtpProvider } from '../providers/smtp.provider.js';
import { encryptSecret } from '../utils/crypto.js';
import { BadRequestError } from '../utils/errors.js';
import { MAILBOX_TYPES, MAILBOX_STATUS } from '../config/constants.js';

export class MailboxService {
  /**
   * Generates authorization URL for connecting a Gmail mailbox.
   * @param {string} workspaceId
   * @param {string} userId
   * @returns {string}
   */
  static getConnectGoogleUrl(workspaceId, userId) {
    const statePayload = Buffer.from(JSON.stringify({ workspaceId, userId, timestamp: Date.now() })).toString('base64url');
    return GoogleProvider.getMailboxAuthUrl(statePayload);
  }

  /**
   * Handles Google OAuth callback for Mailbox authorization.
   * @param {string} code
   * @param {string} state
   * @returns {Promise<object>} Connected mailbox summary
   */
  static async handleGoogleMailboxCallback(code, state) {
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    } catch {
      throw new BadRequestError('Invalid or corrupted OAuth state parameter');
    }

    const tokens = await GoogleProvider.exchangeCode(code);
    if (!tokens.refresh_token) {
      throw new BadRequestError(
        'Google did not return a refresh token. Please remove app access from Google Account and reconnect.'
      );
    }

    const profile = await GoogleProvider.getUserProfile(tokens.access_token);
    const encryptedToken = encryptSecret(tokens.refresh_token);

    // Domain representation of connected mailbox
    return {
      type: MAILBOX_TYPES.GMAIL_OAUTH,
      email: profile.email,
      workspaceId: stateData.workspaceId,
      status: MAILBOX_STATUS.ACTIVE,
      encryptedCredentials: encryptedToken,
      dailyCap: 500,
    };
  }

  /**
   * Verifies and securely saves SMTP mailbox credentials.
   * @param {string} workspaceId
   * @param {object} smtpConfig
   * @returns {Promise<object>} Connected mailbox summary
   */
  static async connectSmtpMailbox(workspaceId, smtpConfig) {
    try {
      await SmtpProvider.verifyConnection({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      });
    } catch (err) {
      throw new BadRequestError(`SMTP connection test failed: ${err.message}`);
    }

    const encryptedPassword = encryptSecret(smtpConfig.pass);

    return {
      type: MAILBOX_TYPES.SMTP,
      email: smtpConfig.fromEmail,
      workspaceId,
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.user,
      encryptedCredentials: encryptedPassword,
      dailyCap: smtpConfig.dailyCap || 500,
      status: MAILBOX_STATUS.ACTIVE,
    };
  }
}
