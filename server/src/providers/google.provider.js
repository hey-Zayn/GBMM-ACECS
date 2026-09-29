import { google } from 'googleapis';
import { env } from '../config/env.js';
import { GOOGLE_OAUTH_SCOPES } from '../config/constants.js';

export class GoogleProvider {
  /**
   * Initializes a Google OAuth2 client.
   * @param {string} [customRedirectUri]
   */
  static createOAuthClient(customRedirectUri) {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      customRedirectUri || env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generates authorization URL for User Sign-In.
   * @param {string} [state]
   * @returns {string}
   */
  static getUserAuthUrl(state) {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'online',
      scope: GOOGLE_OAUTH_SCOPES.USER_AUTH,
      ...(state ? { state } : {}),
    });
  }

  /**
   * Generates authorization URL for Mailbox Connection (with refresh token & gmail.send scope).
   * @param {string} state - HMAC or CSRF state carrying workspace context
   * @returns {string}
   */
  static getMailboxAuthUrl(state) {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Required to receive a refresh_token
      scope: GOOGLE_OAUTH_SCOPES.MAILBOX_SEND,
      state,
    });
  }

  /**
   * Exchanges an authorization code for OAuth tokens.
   * @param {string} code
   * @returns {Promise<{ access_token?: string | null, refresh_token?: string | null, id_token?: string | null }>}
   */
  static async exchangeCode(code) {
    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  /**
   * Fetches the user profile from Google.
   * @param {string} accessToken
   * @returns {Promise<{ id: string, email: string, name: string, picture?: string }>}
   */
  static async getUserProfile(accessToken) {
    const client = this.createOAuthClient();
    client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data } = await oauth2.userinfo.get();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  }

  /**
   * Refreshes an expired access token using the stored refresh token.
   * @param {string} refreshToken
   * @returns {Promise<string>} Fresh access token
   */
  static async refreshAccessToken(refreshToken) {
    const client = this.createOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await client.refreshAccessToken();
    return credentials.access_token;
  }
}
