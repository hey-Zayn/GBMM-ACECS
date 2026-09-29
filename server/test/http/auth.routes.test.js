import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authServiceMock = vi.hoisted(() => ({
  getGoogleLoginUrl: vi.fn(),
  processGoogleLogin: vi.fn(),
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

  it('creates a session without returning the raw token in JSON', async () => {
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

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('user@example.com');
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
});
