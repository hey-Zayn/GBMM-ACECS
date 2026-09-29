import { z } from 'zod';

export const connectSmtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.coerce.number().int().min(1).max(65535, 'Invalid port number'),
  secure: z.boolean().default(false),
  user: z.string().min(1, 'SMTP user/email is required'),
  pass: z.string().min(1, 'SMTP password is required'),
  fromEmail: z.string().email('Valid from email address is required'),
  fromName: z.string().optional(),
  dailyCap: z.coerce.number().int().min(1).max(5000).default(500),
});

export const mailboxOAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State token is required for CSRF validation'),
});
