import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, UnauthorizedError } from '../../src/utils/errors.js';

const authServiceMock = vi.hoisted(() => ({
  verifyAndTouchSession: vi.fn(),
}));

const mailboxServiceMock = vi.hoisted(() => ({
  getConnectGoogleUrl: vi.fn(),
  discoverMailboxProvider: vi.fn(),
  handleGoogleMailboxCallback: vi.fn(),
  connectSmtpMailbox: vi.fn(),
  getWorkspaceMailboxes: vi.fn(),
  disconnectMailbox: vi.fn(),
  testMailboxConnection: vi.fn(),
}));

vi.mock('../../src/services/auth.service.js', () => ({ authService: authServiceMock }));
vi.mock('../../src/services/mailbox.service.js', () => ({ mailboxService: mailboxServiceMock }));
vi.mock('../../src/middlewares/rateLimit.middleware.js', async importOriginal => ({
  ...(await importOriginal()),
  mailboxConnectRateLimit: (_req, _res, next) => next(),
  mailboxOAuthRateLimit: (_req, _res, next) => next(),
  mailboxTestRateLimit: (_req, _res, next) => next(),
}));

const { default: app } = await import('../../src/app.js');

describe('mailbox HTTP routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authServiceMock.verifyAndTouchSession.mockReset();
    authServiceMock.verifyAndTouchSession.mockResolvedValue({
      userId: 'user-id',
      workspaceId: 'workspace-id',
      sessionId: 'session-id',
    });
  });

  it('rejects unauthenticated mailbox access', async () => {
    authServiceMock.verifyAndTouchSession.mockRejectedValueOnce(
      new UnauthorizedError('Authentication required')
    );

    const response = await request(app).get('/api/v1/mailboxes');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('lists safe mailbox DTOs for the active workspace', async () => {
    mailboxServiceMock.getWorkspaceMailboxes.mockResolvedValue([
      {
        id: 'mailbox-id',
        workspaceId: 'workspace-id',
        type: 'SMTP',
        email: 'sender@example.test',
        status: 'ACTIVE',
        dailyCap: 500,
        sentTodayCount: 10,
        remainingToday: 490,
      },
    ]);

    const response = await request(app)
      .get('/api/v1/mailboxes')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.mailboxes[0].email).toBe('sender@example.test');
    expect(response.body.data.mailboxes[0]).not.toHaveProperty('encryptedCredentials');
    expect(mailboxServiceMock.getWorkspaceMailboxes).toHaveBeenCalledWith('workspace-id');
  });

  it('discovers a provider without connecting or exposing credentials', async () => {
    mailboxServiceMock.discoverMailboxProvider.mockReturnValue({
      email: 'sender@gmail.com',
      suggestedProvider: 'GOOGLE',
      providerStatus: 'SUPPORTED',
      availableMethods: ['GOOGLE_OAUTH', 'SMTP'],
      recommendedMethod: 'GOOGLE_OAUTH',
      connectEndpoint: '/mailboxes/google/connect',
      connectionMode: 'OAUTH',
      requiresAdvancedSetup: false,
    });

    const response = await request(app)
      .post('/api/v1/mailboxes/discover')
      .set('Cookie', 'gmass_session=session-token')
      .send({ email: 'Sender@Gmail.com' });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      email: 'sender@gmail.com',
      suggestedProvider: 'GOOGLE',
      providerStatus: 'SUPPORTED',
      availableMethods: ['GOOGLE_OAUTH', 'SMTP'],
      recommendedMethod: 'GOOGLE_OAUTH',
      connectEndpoint: '/mailboxes/google/connect',
      connectionMode: 'OAUTH',
      requiresAdvancedSetup: false,
    });
    expect(mailboxServiceMock.discoverMailboxProvider).toHaveBeenCalledWith('Sender@Gmail.com');
  });

  it('validates the discovery email before calling the service', async () => {
    const response = await request(app)
      .post('/api/v1/mailboxes/discover')
      .set('Cookie', 'gmass_session=session-token')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(mailboxServiceMock.discoverMailboxProvider).not.toHaveBeenCalled();
  });

  it('starts the protected Gmail connection flow for the active workspace', async () => {
    mailboxServiceMock.getConnectGoogleUrl.mockResolvedValue({
      url: 'https://accounts.google.com/o/oauth2/auth?state=signed-state',
      browserChallenge: 'browser-challenge',
    });

    const response = await request(app)
      .get('/api/v1/mailboxes/google/connect')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.url).toContain('accounts.google.com');
    expect(response.headers['set-cookie'].join(';')).toContain(
      'gmass_oauth_challenge=browser-challenge'
    );
    expect(mailboxServiceMock.getConnectGoogleUrl).toHaveBeenCalledWith(
      'workspace-id',
      'user-id'
    );
  });

  it('rejects invalid SMTP input before connecting to a provider', async () => {
    const response = await request(app)
      .post('/api/v1/mailboxes/smtp')
      .set('Cookie', 'gmass_session=session-token')
      .send({ host: 'smtp.example.com', port: 587 });

    expect(response.status).toBe(400);
    expect(mailboxServiceMock.connectSmtpMailbox).not.toHaveBeenCalled();
  });

  it('returns a safe DTO after SMTP connection', async () => {
    mailboxServiceMock.connectSmtpMailbox.mockResolvedValue({
      id: 'mailbox-id',
      workspaceId: 'workspace-id',
      type: 'SMTP',
      email: 'sender@example.test',
      status: 'ACTIVE',
    });

    const response = await request(app)
      .post('/api/v1/mailboxes/smtp')
      .set('Cookie', 'gmass_session=session-token')
      .send({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'sender@example.test',
        pass: 'development-only-password',
        fromEmail: 'sender@example.test',
        fromName: 'Sender',
        dailyCap: 500,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).not.toHaveProperty('encryptedCredentials');
    expect(response.body.data).not.toHaveProperty('pass');
    expect(mailboxServiceMock.connectSmtpMailbox).toHaveBeenCalledWith(
      'workspace-id',
      expect.objectContaining({ fromEmail: 'sender@example.test' })
    );
  });

  it('disconnects a mailbox within the active workspace', async () => {
    mailboxServiceMock.disconnectMailbox.mockResolvedValue({
      id: 'mailbox-id',
      workspaceId: 'workspace-id',
      status: 'DISCONNECTED',
    });

    const response = await request(app)
      .post('/api/v1/mailboxes/11111111-1111-4111-8111-111111111111/disconnect')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('DISCONNECTED');
    expect(mailboxServiceMock.disconnectMailbox).toHaveBeenCalledWith(
      'workspace-id',
      '11111111-1111-4111-8111-111111111111'
    );
  });

  it('rejects an invalid mailbox ID before the service runs', async () => {
    const response = await request(app)
      .post('/api/v1/mailboxes/not-a-uuid/disconnect')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(400);
    expect(mailboxServiceMock.disconnectMailbox).not.toHaveBeenCalled();
  });

  it('tests a mailbox within the active workspace', async () => {
    mailboxServiceMock.testMailboxConnection.mockResolvedValue({
      id: 'mailbox-id',
      workspaceId: 'workspace-id',
      status: 'ACTIVE',
      lastErrorCode: null,
    });

    const response = await request(app)
      .post('/api/v1/mailboxes/11111111-1111-4111-8111-111111111111/test')
      .set('Cookie', 'gmass_session=session-token');

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ACTIVE');
    expect(response.body.data).not.toHaveProperty('encryptedCredentials');
    expect(mailboxServiceMock.testMailboxConnection).toHaveBeenCalledWith(
      'workspace-id',
      '11111111-1111-4111-8111-111111111111'
    );
  });

  it('handles provider-denied OAuth consent without exchanging a code', async () => {
    mailboxServiceMock.handleGoogleMailboxCallback.mockRejectedValueOnce(
      new BadRequestError('Google authorization was not completed')
    );

    const response = await request(app)
      .get('/api/v1/mailboxes/google/callback?error=access_denied&state=state')
      .set('Cookie', 'gmass_session=session-token; gmass_oauth_challenge=browser-challenge');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('http://localhost:3000/dashboard/mailboxes?google=cancelled');
    expect(response.headers['set-cookie'].join(';')).toContain('gmass_oauth_challenge=;');
    expect(mailboxServiceMock.handleGoogleMailboxCallback).toHaveBeenCalledWith(
      undefined,
      'state',
      'browser-challenge',
      expect.objectContaining({ workspaceId: 'workspace-id' }),
      'access_denied'
    );
  });

  it('returns to the mailbox page after Gmail connects successfully', async () => {
    mailboxServiceMock.handleGoogleMailboxCallback.mockResolvedValueOnce({
      id: 'mailbox-id',
      email: 'sender@gmail.com',
      status: 'ACTIVE',
    });

    const response = await request(app)
      .get('/api/v1/mailboxes/google/callback?code=authorization-code&state=state')
      .set('Cookie', 'gmass_session=session-token; gmass_oauth_challenge=browser-challenge');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('http://localhost:3000/dashboard/mailboxes?google=connected');
  });
});
