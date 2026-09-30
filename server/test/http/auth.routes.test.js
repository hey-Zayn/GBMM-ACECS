import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../src/utils/errors.js';

const authServiceMock = vi.hoisted(() => ({
  getGoogleLoginUrl: vi.fn(),
  processGoogleLogin: vi.fn(),
  requestEmailOtp: vi.fn(),
  verifyEmailOtp: vi.fn(),
  verifyAndTouchSession: vi.fn(),
  revokeSession: vi.fn(),
}));

const passThroughRateLimit = vi.hoisted(() => (req, res, next) => next());

vi.mock('../../src/services/auth.service.js', () => ({ authService: authServiceMock }));
vi.mock('../../src/middlewares/rateLimit.middleware.js', () => ({
  loginRateLimit: passThroughRateLimit,
  oauthCallbackRateLimit: passThroughRateLimit,
  logoutRateLimit: passThroughRateLimit,
}));

const { default: app } = await import('../../src/app.js');

describe('authentication HTTP routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to Google and sets a browser challenge cookie', async () => {
    authServiceMock.getGoogleLoginUrl.mockResolvedValue({
      url: 'https://accounts.google.com/o/oauth2/v2/auth?state=state',
      browserChallenge: 'browser-challenge',
    });

    const response = await request(app).get('/api/v1/auth/google');

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('accounts.google.com');
    expect(response.headers['set-cookie'][0]).toContain('gmass_oauth_challenge=browser-challenge');
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('requests an email OTP with a generic response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/email/request-otp')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('sign-in code');
    expect(authServiceMock.requestEmailOtp).toHaveBeenCalledWith('user@example.com');
  });

  it('returns a signup response when the email has no account', async () => {
    authServiceMock.requestEmailOtp.mockRejectedValue(
      new NotFoundError('Account not found. Please sign up first.')
    );

    const response = await request(app)
      .post('/api/v1/auth/email/request-otp')
      .send({ email: 'new@example.com' });

    expect(response.status).toBe(404);
    expect(response.body.error.message).toContain('Please sign up first');
  });

  it('creates a session after a valid email OTP', async () => {
    authServiceMock.verifyEmailOtp.mockResolvedValue({
      user: { id: 'user-id', email: 'user@example.com', workspaceId: 'workspace-id' },
      sessionToken: 'opaque-session-token',
    });

    const response = await request(app)
      .post('/api/v1/auth/email/verify-otp')
      .send({ email: 'user@example.com', otp: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('user@example.com');
    expect(response.headers['set-cookie'].join(';')).toContain('gmass_session=opaque-session-token');
  });

  it('creates a session and redirects to the dashboard without returning the raw token', async () => {
    authServiceMock.processGoogleLogin.mockResolvedValue({
      user: {
        id: 'user-id',
        email: 'user@example.com',
        displayName: 'User',
        avatarUrl: null,
        workspaceId: 'workspace-id',
      },
      sessionToken: 'opaque-session-token',
    });

    const response = await request(app)
      .get('/api/v1/auth/google/callback?code=code&state=state')
      .set('Cookie', 'gmass_oauth_challenge=browser-challenge');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('http://localhost:3000/dashboard');
    expect(response.body).not.toHaveProperty('data.sessionToken');
    expect(response.headers['set-cookie'].join(';')).toContain('gmass_session=opaque-session-token');
  });

  it('rejects an invalid callback query before the controller runs', async () => {
    const response = await request(app).get('/api/v1/auth/google/callback');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
    expect(authServiceMock.processGoogleLogin).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated access to the current-user endpoint', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns the authenticated user from the current-user endpoint', async () => {
    authServiceMock.verifyAndTouchSession.mockResolvedValue({
      userId: 'user-id',
      workspaceId: 'workspace-id',
      email: 'user@example.com',
      sessionId: 'session-id',
      displayName: 'User',
      avatarUrl: null,
    });

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', 'gmass_session=opaque-session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      userId: 'user-id',
      workspaceId: 'workspace-id',
    });
  });

  it('revokes the session during logout and clears the cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', 'gmass_session=opaque-session-token');

    expect(response.status).toBe(200);
    expect(authServiceMock.revokeSession).toHaveBeenCalledWith('opaque-session-token');
    expect(response.headers['set-cookie'].join(';')).toContain('gmass_session=;');
  });

  it('clears the session cookie when session revocation fails', async () => {
    authServiceMock.revokeSession.mockRejectedValue(new Error('database unavailable'));

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', 'gmass_session=opaque-session-token');

    expect(response.status).toBe(500);
    expect(response.headers['set-cookie'].join(';')).toContain('gmass_session=;');
  });
});
