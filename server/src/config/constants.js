export const AUTH_COOKIE_NAME = 'gmass_session';
export const OAUTH_CHALLENGE_COOKIE_NAME = 'gmass_oauth_challenge';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const OAUTH_CHALLENGE_TTL_MS = 10 * 60 * 1000;
export const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
export const EMAIL_OTP_MAX_ATTEMPTS = 5;
export const EMAIL_OTP_LENGTH = 6;

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
  ERROR: 'ERROR',
};
