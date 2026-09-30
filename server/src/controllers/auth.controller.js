import { authService } from '../services/auth.service.js';
import {
  AUTH_COOKIE_NAME,
  OAUTH_CHALLENGE_COOKIE_NAME,
  OAUTH_CHALLENGE_TTL_MS,
  SESSION_TTL_MS,
} from '../config/constants.js';
import { env } from '../config/env.js';

const sessionCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

const challengeCookieOptions = {
  ...sessionCookieOptions,
  maxAge: OAUTH_CHALLENGE_TTL_MS,
};

const genericOtpResponse = {
  success: true,
  message: 'If the email is valid, a sign-in code has been sent.',
};

export class AuthController {
  async requestEmailOtp(req, res, next) {
    try {
      await authService.requestEmailOtp(req.body.email);
      res.status(200).json(genericOtpResponse);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmailOtp(req, res, next) {
    try {
      const { user, sessionToken } = await authService.verifyEmailOtp(
        req.body.email,
        req.body.otp
      );
      res.cookie(AUTH_COOKIE_NAME, sessionToken, {
        ...sessionCookieOptions,
        maxAge: SESSION_TTL_MS,
      });
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async requestSignupOtp(req, res, next) {
    try {
      await authService.requestSignupOtp(req.body.displayName, req.body.email);
      res.status(200).json({
        success: true,
        message: 'A signup verification code has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifySignupOtp(req, res, next) {
    try {
      const { user, sessionToken } = await authService.verifySignupOtp(
        req.body.email,
        req.body.otp
      );
      res.cookie(AUTH_COOKIE_NAME, sessionToken, {
        ...sessionCookieOptions,
        maxAge: SESSION_TTL_MS,
      });
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req, res, next) {
    try {
      const { url, browserChallenge } = await authService.getGoogleLoginUrl();
      res.cookie(OAUTH_CHALLENGE_COOKIE_NAME, browserChallenge, challengeCookieOptions);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      const browserChallenge = req.cookies?.[OAUTH_CHALLENGE_COOKIE_NAME];
      const { user, sessionToken } = await authService.processGoogleLogin(
        code,
        state,
        browserChallenge
      );

      res.clearCookie(OAUTH_CHALLENGE_COOKIE_NAME, sessionCookieOptions);
      res.cookie(AUTH_COOKIE_NAME, sessionToken, {
        ...sessionCookieOptions,
        maxAge: SESSION_TTL_MS,
      });
      res.redirect(302, new URL('/dashboard', env.WEB_ORIGIN).toString());
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.revokeSession(req.cookies?.[AUTH_COOKIE_NAME]);
      res.clearCookie(AUTH_COOKIE_NAME, sessionCookieOptions);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  me(req, res) {
    res.status(200).json({ success: true, data: { user: req.user } });
  }
}

export const authController = new AuthController();
