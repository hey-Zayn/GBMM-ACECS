import nodemailer from 'nodemailer';

export class SmtpProvider {
  /**
   * Verifies an SMTP connection with given credentials.
   * @param {{ host: string, port: number, secure: boolean, user: string, pass: string }} config
   * @returns {Promise<boolean>}
   */
  static async verifyConnection({ host, port, secure, user, pass }) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000, // 10s timeout
    });

    await transporter.verify();
    return true;
  }
}
