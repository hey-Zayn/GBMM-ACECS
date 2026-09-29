import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { JWT_EXPIRY } from '../config/constants.js';
import { GoogleProvider } from '../providers/google.provider.js';
import { UnauthorizedError } from '../utils/errors.js';

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export class AuthService {
  /**
   * Signs a JWT session token.
   * @param {{ userId: string, workspaceId: string, email: string, name?: string }} payload
   * @returns {Promise<string>}
   */
  static async createSessionToken(payload) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(secretKey);
  }

  /**
   * Verifies a session JWT token.
   * @param {string} token
   * @returns {Promise<{ userId: string, workspaceId: string, email: string, name?: string }>}
   */
  static async verifySessionToken(token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      return payload;
    } catch {
      throw new UnauthorizedError('Invalid or expired session token');
    }
  }

  /**
   * Generates Google OAuth redirect URL for login.
   * @returns {string}
   */
  static getGoogleLoginUrl() {
    return GoogleProvider.getUserAuthUrl();
  }

  /**
   * Processes the Google OAuth callback for user login.
   * @param {string} code
   * @returns {Promise<{ user: object, token: string }>}
   */
  static async processGoogleLogin(code) {
    const tokens = await GoogleProvider.exchangeCode(code);
    if (!tokens.access_token) {
      throw new UnauthorizedError('Failed to obtain Google access token');
    }

    const profile = await GoogleProvider.getUserProfile(tokens.access_token);

    // In-memory / mock workspace resolution for Phase 1 MVP until DB is connected
    const userId = profile.id;
    const workspaceId = `ws_${profile.id}`;

    const user = {
      id: userId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      workspaceId,
    };

    const token = await this.createSessionToken({
      userId: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }
}
