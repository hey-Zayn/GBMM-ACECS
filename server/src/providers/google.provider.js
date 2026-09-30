import { google } from 'googleapis';
import { env } from '../config/env.js';
import { GOOGLE_OAUTH_SCOPES } from '../config/constants.js';

export class GoogleProvider {
  static createOAuthClient(customRedirectUri) {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      customRedirectUri || env.GOOGLE_REDIRECT_URI
    );
  }

  static getUserAuthUrl(state) {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'online',
      scope: GOOGLE_OAUTH_SCOPES.USER_AUTH,
      state,
    });
  }

  static getMailboxAuthUrl(state) {
    const client = this.createOAuthClient(env.GOOGLE_MAILBOX_REDIRECT_URI);
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_OAUTH_SCOPES.MAILBOX_SEND,
      state,
    });
  }

  static async exchangeCode(code, customRedirectUri) {
    const client = this.createOAuthClient(customRedirectUri);
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  static async getUserProfile(accessToken) {
    const client = this.createOAuthClient();
    client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data } = await oauth2.userinfo.get();
    return {
      id: data.id,
      email: data.email,
      verifiedEmail: data.verified_email,
      name: data.name,
      picture: data.picture,
    };
  }

  static async refreshAccessToken(refreshToken) {
    const client = this.createOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await client.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error('Google did not return a refreshed access token');
    }
    return credentials.access_token;
  }
}
