import { describe, expect, it } from 'vitest';
import { SmtpProvider } from '../../src/providers/smtp.provider.js';

describe('SMTP provider network protection', () => {
  it.each(['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '::1'])(
    'rejects private host %s',
    async (host) => {
      await expect(
        SmtpProvider.verifyConnection({
          host,
          port: 587,
          secure: false,
          user: 'user@example.com',
          pass: 'secret',
        })
      ).rejects.toThrow('SMTP host is not allowed');
    }
  );

  it('rejects uncommon SMTP ports before opening a connection', async () => {
    await expect(
      SmtpProvider.verifyConnection({
        host: 'smtp.example.com',
        port: 22,
        secure: false,
        user: 'user@example.com',
        pass: 'secret',
      })
    ).rejects.toThrow('SMTP port is not allowed');
  });

  it('rejects URL-shaped SMTP hosts', async () => {
    await expect(
      SmtpProvider.verifyConnection({
        host: 'https://smtp.example.com',
        port: 587,
        secure: false,
        user: 'user@example.com',
        pass: 'secret',
      })
    ).rejects.toThrow('SMTP host is not allowed');
  });
});
