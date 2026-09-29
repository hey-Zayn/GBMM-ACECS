import { mailboxService } from '../services/mailbox.service.js';
import { env } from '../config/env.js';
import { OAUTH_CHALLENGE_COOKIE_NAME, OAUTH_CHALLENGE_TTL_MS } from '../config/constants.js';

const challengeCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: OAUTH_CHALLENGE_TTL_MS,
  path: '/',
};

export class MailboxController {
  async connectGoogle(req, res, next) {
    try {
      const { workspaceId, userId } = req.user;
      const { url, browserChallenge } = await mailboxService.getConnectGoogleUrl(workspaceId, userId);
      res.cookie(OAUTH_CHALLENGE_COOKIE_NAME, browserChallenge, challengeCookieOptions);
      res.status(200).json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      const challenge = req.cookies?.[OAUTH_CHALLENGE_COOKIE_NAME];
      const mailbox = await mailboxService.handleGoogleMailboxCallback(
        code,
        state,
        challenge,
        req.user
      );
      res.clearCookie(OAUTH_CHALLENGE_COOKIE_NAME, challengeCookieOptions);
      const { encryptedCredentials, ...safeMailbox } = mailbox;
      res.status(201).json({
        success: true,
        message: 'Gmail mailbox connected successfully',
        data: safeMailbox,
      });
    } catch (error) {
      next(error);
    }
  }

  async connectSmtp(req, res, next) {
    try {
      const mailbox = await mailboxService.connectSmtpMailbox(req.user.workspaceId, req.body);
      const { encryptedCredentials, ...safeMailbox } = mailbox;
      res.status(201).json({
        success: true,
        message: 'SMTP mailbox connected successfully',
        data: safeMailbox,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mailboxController = new MailboxController();
