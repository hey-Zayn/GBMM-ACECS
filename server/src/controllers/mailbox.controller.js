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

  async discover(req, res, next) {
    try {
      const result = mailboxService.discoverMailboxProvider(req.body.email);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      const challenge = req.cookies?.[OAUTH_CHALLENGE_COOKIE_NAME];
      await mailboxService.handleGoogleMailboxCallback(
        code,
        state,
        challenge,
        req.user,
        req.query.error
      );
      res.clearCookie(OAUTH_CHALLENGE_COOKIE_NAME, challengeCookieOptions);
      redirectToMailboxPage(res, 'connected');
    } catch (error) {
      res.clearCookie(OAUTH_CHALLENGE_COOKIE_NAME, challengeCookieOptions);
      redirectToMailboxPage(res, req.query.error ? 'cancelled' : 'connection_failed');
    }
  }

  async connectSmtp(req, res, next) {
    try {
      const mailbox = await mailboxService.connectSmtpMailbox(req.user.workspaceId, req.body);
      res.status(201).json({
        success: true,
        message: 'SMTP mailbox connected successfully',
        data: mailbox,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const mailboxes = await mailboxService.getWorkspaceMailboxes(req.user.workspaceId);
      res.status(200).json({ success: true, data: { mailboxes } });
    } catch (error) {
      next(error);
    }
  }

  async disconnect(req, res, next) {
    try {
      const mailbox = await mailboxService.disconnectMailbox(
        req.user.workspaceId,
        req.params.mailboxId
      );
      res.status(200).json({
        success: true,
        message: 'Mailbox disconnected successfully',
        data: mailbox,
      });
    } catch (error) {
      next(error);
    }
  }

  async test(req, res, next) {
    try {
      const mailbox = await mailboxService.testMailboxConnection(
        req.user.workspaceId,
        req.params.mailboxId
      );
      res.status(200).json({
        success: true,
        message: 'Mailbox connection verified successfully',
        data: mailbox,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mailboxController = new MailboxController();

function redirectToMailboxPage(res, result) {
  const redirectUrl = new URL('/dashboard/mailboxes', env.WEB_ORIGIN);
  redirectUrl.searchParams.set('google', result);
  res.redirect(302, redirectUrl.toString());
}
