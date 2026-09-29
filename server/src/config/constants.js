export const AUTH_COOKIE_NAME = 'gmass_session';

export const JWT_EXPIRY = '7d';

export const GOOGLE_OAUTH_SCOPES = {
  USER_AUTH: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  MAILBOX_SEND: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
};

export const MAILBOX_TYPES = {
  GMAIL_OAUTH: 'GMAIL_OAUTH',
  SMTP: 'SMTP',
};

export const MAILBOX_STATUS = {
  ACTIVE: 'ACTIVE',
  DISCONNECTED: 'DISCONNECTED',
  RATE_LIMITED: 'RATE_LIMITED',
};
