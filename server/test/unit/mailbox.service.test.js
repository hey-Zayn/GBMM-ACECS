import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encryptSecret } from '../../src/utils/crypto.js';

const googleProviderMock = vi.hoisted(() => ({
  exchangeCode: vi.fn(),
  refreshAccessToken: vi.fn(),
  getUserProfile: vi.fn(),
}));

const smtpProviderMock = vi.hoisted(() => ({
  verifyConnection: vi.fn(),
}));

const repositoryMock = vi.hoisted(() => ({
  createMailbox: vi.fn(),
  findMailbox: vi.fn(),
  updateMailbox: vi.fn(),
}));

const oauthStateMock = vi.hoisted(() => ({
  createOAuthState: vi.fn(),
  consumeOAuthState: vi.fn(),
}));

vi.mock('../../src/providers/google.provider.js', () => ({ GoogleProvider: googleProviderMock }));
vi.mock('../../src/providers/smtp.provider.js', () => ({ SmtpProvider: smtpProviderMock }));
vi.mock('../../src/repositories/mailbox.repository.js', () => ({
  createMailbox: repositoryMock.createMailbox,
  findMailbox: repositoryMock.findMailbox,
  findMailboxByEmail: vi.fn(),
  findMailboxByProviderAccountId: vi.fn(),
  listMailboxes: vi.fn(),
  updateMailbox: repositoryMock.updateMailbox,
}));
vi.mock('../../src/utils/oauthState.js', () => oauthStateMock);

const { mailboxService } = await import('../../src/services/mailbox.service.js');

describe('mailbox connection tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('suggests Google OAuth for Gmail addresses', () => {
    expect(mailboxService.discoverMailboxProvider(' Sender@GMAIL.COM ')).toEqual({
      email: 'sender@gmail.com',
      suggestedProvider: 'GOOGLE',
      providerStatus: 'SUPPORTED',
      availableMethods: ['GOOGLE_OAUTH', 'SMTP'],
      recommendedMethod: 'GOOGLE_OAUTH',
      connectEndpoint: '/mailboxes/google/connect',
      connectionMode: 'OAUTH',
      requiresAdvancedSetup: false,
    });
  });

  it('keeps unknown providers on the SMTP fallback path', () => {
    expect(mailboxService.discoverMailboxProvider('sender@example.com')).toEqual({
      email: 'sender@example.com',
      suggestedProvider: 'OTHER',
      providerStatus: 'FALLBACK',
      availableMethods: ['SMTP'],
      recommendedMethod: 'SMTP',
      connectEndpoint: '/mailboxes/smtp',
      connectionMode: 'ADVANCED_SMTP',
      requiresAdvancedSetup: true,
    });
  });

  it('identifies Microsoft addresses as planned while keeping SMTP available', () => {
    expect(mailboxService.discoverMailboxProvider('sender@outlook.com')).toEqual({
      email: 'sender@outlook.com',
      suggestedProvider: 'MICROSOFT',
      providerStatus: 'PLANNED',
      availableMethods: ['SMTP'],
      recommendedMethod: 'SMTP',
      connectEndpoint: '/mailboxes/smtp',
      connectionMode: 'ADVANCED_SMTP',
      requiresAdvancedSetup: true,
    });
  });

  it('verifies SMTP credentials and updates mailbox health', async () => {
    const mailbox = createMailbox({
      type: 'SMTP',
      encryptedCredentials: encryptSecret(JSON.stringify({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'sender@example.com',
        pass: 'secret',
      })),
    });
    const updated = { ...mailbox, status: 'ACTIVE', lastErrorCode: null };
    repositoryMock.findMailbox.mockResolvedValueOnce(mailbox).mockResolvedValueOnce(updated);

    const result = await mailboxService.testMailboxConnection('workspace-id', 'mailbox-id');

    expect(smtpProviderMock.verifyConnection).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      user: 'sender@example.com',
      pass: 'secret',
    });
    expect(repositoryMock.updateMailbox).toHaveBeenCalledWith(
      'workspace-id',
      'mailbox-id',
      expect.objectContaining({ status: 'ACTIVE', lastErrorCode: null })
    );
    expect(result).not.toHaveProperty('encryptedCredentials');
  });

  it('marks a failed provider test as an error without exposing provider details', async () => {
    const mailbox = createMailbox({
      type: 'SMTP',
      encryptedCredentials: encryptSecret(JSON.stringify({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'sender@example.com',
        pass: 'secret',
      })),
    });
    repositoryMock.findMailbox.mockResolvedValueOnce(mailbox);
    smtpProviderMock.verifyConnection.mockRejectedValueOnce(new Error('password leaked here'));

    await expect(
      mailboxService.testMailboxConnection('workspace-id', 'mailbox-id')
    ).rejects.toThrow('Mailbox connection test failed');

    expect(repositoryMock.updateMailbox).toHaveBeenCalledWith(
      'workspace-id',
      'mailbox-id',
      { status: 'ERROR', lastErrorCode: 'CONNECTION_TEST_FAILED' }
    );
  });

  it('classifies provider authentication failures without exposing provider details', async () => {
    const mailbox = createMailbox({
      type: 'GMAIL_OAUTH',
      encryptedCredentials: encryptSecret(JSON.stringify({ refreshToken: 'refresh-token' })),
    });
    repositoryMock.findMailbox.mockResolvedValueOnce(mailbox);
    googleProviderMock.refreshAccessToken.mockRejectedValueOnce({ response: { status: 401 } });

    await expect(
      mailboxService.testMailboxConnection('workspace-id', 'mailbox-id')
    ).rejects.toThrow('Mailbox connection test failed');

    expect(repositoryMock.updateMailbox).toHaveBeenCalledWith(
      'workspace-id',
      'mailbox-id',
      { status: 'ERROR', lastErrorCode: 'PROVIDER_AUTH_FAILED' }
    );
  });

  it('verifies Gmail identity after refreshing its access token', async () => {
    const mailbox = createMailbox({
      type: 'GMAIL_OAUTH',
      email: 'sender@example.com',
      encryptedCredentials: encryptSecret(JSON.stringify({ refreshToken: 'refresh-token' })),
    });
    const updated = { ...mailbox, status: 'ACTIVE', lastErrorCode: null };
    repositoryMock.findMailbox.mockResolvedValueOnce(mailbox).mockResolvedValueOnce(updated);
    googleProviderMock.refreshAccessToken.mockResolvedValue('access-token');
    googleProviderMock.getUserProfile.mockResolvedValue({
      email: 'SENDER@example.com',
      verifiedEmail: true,
    });

    await mailboxService.testMailboxConnection('workspace-id', 'mailbox-id');

    expect(googleProviderMock.refreshAccessToken).toHaveBeenCalledWith('refresh-token');
    expect(googleProviderMock.getUserProfile).toHaveBeenCalledWith('access-token');
  });

  it('rejects a Google callback without a refresh token', async () => {
    oauthStateMock.consumeOAuthState.mockResolvedValue({
      intent: 'mailbox',
      userId: 'user-id',
      workspaceId: 'workspace-id',
    });
    googleProviderMock.exchangeCode.mockResolvedValue({ access_token: 'access-token' });

    await expect(
      mailboxService.handleGoogleMailboxCallback(
        'authorization-code',
        'state',
        'browser-challenge',
        { userId: 'user-id', workspaceId: 'workspace-id' }
      )
    ).rejects.toThrow('required mailbox tokens');

    expect(repositoryMock.createMailbox).not.toHaveBeenCalled();
  });

  it('rejects an unverified Google profile before persistence', async () => {
    oauthStateMock.consumeOAuthState.mockResolvedValue({
      intent: 'mailbox',
      userId: 'user-id',
      workspaceId: 'workspace-id',
    });
    googleProviderMock.exchangeCode.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    googleProviderMock.getUserProfile.mockResolvedValue({
      id: 'google-id',
      email: 'sender@example.com',
      verifiedEmail: false,
    });

    await expect(
      mailboxService.handleGoogleMailboxCallback(
        'authorization-code',
        'state',
        'browser-challenge',
        { userId: 'user-id', workspaceId: 'workspace-id' }
      )
    ).rejects.toThrow('unverified mailbox address');

    expect(repositoryMock.createMailbox).not.toHaveBeenCalled();
  });
});

function createMailbox(overrides = {}) {
  return {
    id: 'mailbox-id',
    workspaceId: 'workspace-id',
    type: 'SMTP',
    email: 'sender@example.com',
    displayName: 'Sender',
    status: 'ACTIVE',
    dailyCap: 500,
    sentTodayCount: 0,
    lastErrorCode: null,
    lastVerifiedAt: null,
    createdAt: new Date('2026-09-30T00:00:00.000Z'),
    updatedAt: new Date('2026-09-30T00:00:00.000Z'),
    ...overrides,
  };
}
