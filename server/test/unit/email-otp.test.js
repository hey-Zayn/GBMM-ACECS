import { beforeEach, describe, expect, it, vi } from 'vitest';

const smtpMock = vi.hoisted(() => ({ sendEmail: vi.fn() }));
const repositoryMock = vi.hoisted(() => ({
  consumeEmailOtpChallenge: vi.fn(),
  createEmailOtpChallenge: vi.fn(),
  createSession: vi.fn(),
  createWorkspace: vi.fn(),
  createMembership: vi.fn(),
  findEmailOtpChallenge: vi.fn(),
  findFirstMembership: vi.fn(),
  findUserByNormalizedEmail: vi.fn(),
  incrementEmailOtpAttempts: vi.fn(),
  invalidateEmailOtpChallenges: vi.fn(),
  upsertUser: vi.fn(),
  withTransaction: vi.fn(),
}));

vi.mock('../../src/providers/smtp.provider.js', () => ({ SmtpProvider: smtpMock }));
vi.mock('../../src/repositories/auth.repository.js', () => ({
  ...repositoryMock,
  createIdentity: vi.fn(),
  findIdentity: vi.fn(),
  findMembership: vi.fn(),
  findValidSession: vi.fn(),
  revokeSession: vi.fn(),
  touchSession: vi.fn(),
}));

const { AuthService } = await import('../../src/services/auth.service.js');

describe('email OTP authentication', () => {
  const service = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
    smtpMock.sendEmail.mockResolvedValue(undefined);
    repositoryMock.withTransaction.mockImplementation(async callback => callback({}));
    repositoryMock.findFirstMembership.mockResolvedValue(null);
    repositoryMock.findUserByNormalizedEmail.mockResolvedValue({ id: 'user-id' });
    repositoryMock.createWorkspace.mockResolvedValue({ id: 'workspace-id' });
    repositoryMock.createMembership.mockResolvedValue({ id: 'membership-id' });
    repositoryMock.createSession.mockResolvedValue({ id: 'session-id' });
  });

  it('sends a six-digit OTP without storing the raw code', async () => {
    await service.requestEmailOtp(' User@Example.com ');

    expect(repositoryMock.createEmailOtpChallenge).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: 'user@example.com',
        codeHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
    expect(smtpMock.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@example.com',
      text: expect.stringMatching(/\d{6}/),
    }));
    expect(repositoryMock.createEmailOtpChallenge.mock.calls[0][1].codeHash)
      .not.toBe(smtpMock.sendEmail.mock.calls[0][0].text.match(/\d{6}/)[0]);
  });

  it('does not send an OTP when the email has no account', async () => {
    repositoryMock.findUserByNormalizedEmail.mockResolvedValue(null);

    await expect(service.requestEmailOtp('new@example.com'))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(repositoryMock.createEmailOtpChallenge).not.toHaveBeenCalled();
    expect(smtpMock.sendEmail).not.toHaveBeenCalled();
  });

  it('rejects an invalid OTP without creating a session', async () => {
    repositoryMock.findEmailOtpChallenge.mockResolvedValue({
      id: 'challenge-id',
      codeHash: 'invalid-hash',
      attempts: 0,
    });

    await expect(service.verifyEmailOtp('user@example.com', '123456'))
      .rejects.toThrow('Invalid or expired email code');
    expect(repositoryMock.incrementEmailOtpAttempts).toHaveBeenCalledWith({}, 'challenge-id');
    expect(repositoryMock.createSession).not.toHaveBeenCalled();
  });

  it('returns a safe service error when SMTP delivery fails', async () => {
    smtpMock.sendEmail.mockRejectedValue(new Error('provider credentials rejected'));

    await expect(service.requestEmailOtp('user@example.com'))
      .rejects.toMatchObject({ statusCode: 503, code: 'SERVICE_UNAVAILABLE' });
  });
});
