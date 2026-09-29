import dns from 'node:dns/promises';
import net from 'node:net';
import nodemailer from 'nodemailer';

export class SmtpProvider {
  static async verifyConnection({ host, port, secure, user, pass }) {
    await assertPublicHost(host);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    try {
      await transporter.verify();
      return true;
    } finally {
      transporter.close();
    }
  }
}

async function assertPublicHost(host) {
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) {
      throw new Error('SMTP host is not allowed');
    }
    return;
  }

  const records = await dns.lookup(host, { all: true });
  if (!records.length || records.some(record => isPrivateAddress(record.address))) {
    throw new Error('SMTP host is not allowed');
  }
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [first, second] = address.split('.').map(Number);
    return first === 10 || first === 127 || (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) || (first === 169 && second === 254) || address === '0.0.0.0';
  }

  const normalized = address.toLowerCase();
  return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') ||
    normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
    normalized.startsWith('fea') || normalized.startsWith('feb');
}
