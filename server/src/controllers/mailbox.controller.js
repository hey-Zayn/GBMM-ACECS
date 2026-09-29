import { MailboxService } from '../services/mailbox.service.js';

export class MailboxController {
  /**
   * Generates Google OAuth consent URL for mailbox connection.
   */
  static connectGoogle(req, res) {
    const { workspaceId, userId } = req.user;
    const url = MailboxService.getConnectGoogleUrl(workspaceId, userId);
    res.status(200).json({
      success: true,
      data: { url },
    });
  }

  /**
   * Handles Google OAuth callback for mailbox connection.
   */
  static async googleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      const mailbox = await MailboxService.handleGoogleMailboxCallback(code, state);

      // Sanitize: Do not send encrypted credentials to client
      const { encryptedCredentials, ...safeMailbox } = mailbox;

      res.status(201).json({
        success: true,
        message: 'Gmail mailbox connected successfully',
        data: safeMailbox,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Verifies and connects an SMTP mailbox.
   */
  static async connectSmtp(req, res, next) {
    try {
      const { workspaceId } = req.user;
      const mailbox = await MailboxService.connectSmtpMailbox(workspaceId, req.body);

      // Sanitize: Do not send encrypted credentials to client
      const { encryptedCredentials, ...safeMailbox } = mailbox;

      res.status(201).json({
        success: true,
        message: 'SMTP mailbox connected successfully',
        data: safeMailbox,
      });
    } catch (err) {
      next(err);
    }
  }
}
