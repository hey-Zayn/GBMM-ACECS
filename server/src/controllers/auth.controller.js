import { AuthService } from '../services/auth.service.js';
import { AUTH_COOKIE_NAME } from '../config/constants.js';
import { env } from '../config/env.js';

export class AuthController {
  /**
   * Redirects user to Google OAuth login URL.
   */
  static googleLogin(req, res) {
    const url = AuthService.getGoogleLoginUrl();
    res.redirect(url);
  }

  /**
   * Handles Google OAuth callback and sets session cookie.
   */
  static async googleCallback(req, res, next) {
    try {
      const { code } = req.query;
      const { user, token } = await AuthService.processGoogleLogin(code);

      res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Clears the session cookie.
   */
  static logout(req, res) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  /**
   * Returns authenticated user info.
   */
  static me(req, res) {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
}
