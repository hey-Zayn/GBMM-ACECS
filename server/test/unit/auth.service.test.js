import { beforeEach, describe, expect, it, vi } from 'vitest';

const googleProviderMock = vi.hoisted(() => ({
  getUserAuthUrl: vi.fn(),
  exchangeCode: vi.fn(),
  getUserProfile: vi.fn(),
}));

const oauthStateMock = vi.hoisted(() => ({
  createOAuthState: vi.fn(),
  consumeOAuthState: vi.fn(),
}));

const repositoryMock = vi.hoisted(() => ({
  createIdentity: vi.fn(),
  createMembership: vi.fn(),
  createSession: vi.fn(),
  createWorkspace: vi.fn(),
  findIdentity: vi.fn(),
  findMembership: vi.fn(),
  findValidSession: vi.fn(),
  findFirstMembership: vi.fn(),
  revokeSession: vi.fn(),
  touchSession: vi.fn(),
  upsertUser: vi.fn(),
  withTransaction: vi.fn(),
}));

vi.mock('../../src/providers/google.provider.js', () => ({ GoogleProvider: googleProviderMock }));
vi.mock('../../src/utils/oauthState.js', () => oauthStateMock);
vi.mock('../../src/repositories/auth.repository.js', () => repositoryMock);

const { AuthService } = await import('../../src/services/auth.service.js');

describe('AuthService', () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
    repositoryMock.withTransaction.mockImplementation(async callback => callback({}));
    repositoryMock.findIdentity.mockResolvedValue(null);
    repositoryMock.findFirstMembership.mockResolvedValue(null);
    repositoryMock.createIdentity.mockResolvedValue({ id: 'identity-id' });
    repositoryMock.createWorkspace.mockResolvedValue({ id: 'workspace-id' });
    repositoryMock.createMembership.mockResolvedValue({ id: 'membership-id' });
    repositoryMock.createSession.mockResolvedValue({ id: 'session-id' });
    oauthStateMock.consumeOAuthState.mockResolvedValue({ intent: 'login' });
  });

  it('creates a session for a verified Google account', async () => {
    const user = {
      id: 'user-id',
      email: 'User@Example.com',
      displayName: 'User',
      avatarUrl: null,
    };
    googleProviderMock.exchangeCode.mockResolvedValue({ access_token: 'access-token' });
    googleProviderMock.getUserProfile.mockResolvedValue({
      id: 'google-id',
      email: 'User@Example.com',
      verifiedEmail: true,
      name: 'User',
    });
    repositoryMock.upsertUser.mockResolvedValue(user);

    const result = await service.processGoogleLogin('code', 'state', 'challenge');

    expect(result.user).toMatchObject({ id: 'user-id', workspaceId: 'workspace-id' });
    expect(result.sessionToken).toEqual(expect.any(String));
    expect(repositoryMock.upsertUser).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      normalizedEmail: 'user@example.com',
    }));
    expect(repositoryMock.createSession).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      userId: 'user-id',
      workspaceId: 'workspace-id',
    }));
  });

  it('rejects an unverified Google account before creating a user', async () => {
    googleProviderMock.exchangeCode.mockResolvedValue({ access_token: 'access-token' });
    googleProviderMock.getUserProfile.mockResolvedValue({
      id: 'google-id',
      email: 'user@example.com',
      verifiedEmail: false,
    });

    await expect(service.processGoogleLogin('code', 'state', 'challenge'))
      .rejects.toThrow('Invalid Google account profile');
    expect(repositoryMock.upsertUser).not.toHaveBeenCalled();
  });

  it('rejects an OAuth state with the wrong intent', async () => {
    oauthStateMock.consumeOAuthState.mockResolvedValue({ intent: 'mailbox' });

    await expect(service.processGoogleLogin('code', 'state', 'challenge'))
      .rejects.toThrow('Invalid OAuth login state');
    expect(googleProviderMock.exchangeCode).not.toHaveBeenCalled();
  });

  it('rejects an invalid session without touching the database', async () => {
    repositoryMock.findValidSession.mockResolvedValue(null);

    await expect(service.verifyAndTouchSession('invalid-token'))
      .rejects.toThrow('Session is invalid, expired, or revoked');
    expect(repositoryMock.findMembership).not.toHaveBeenCalled();
    expect(repositoryMock.touchSession).not.toHaveBeenCalled();
  });
});
