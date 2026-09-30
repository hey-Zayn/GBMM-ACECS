import { z } from 'zod';

export const googleCallbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'OAuth state is required'),
});

export const emailOtpRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const emailOtpVerificationSchema = z.object({
  email: z.string().email('Valid email is required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be six digits'),
});

export const signupOtpRequestSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().email('Valid email is required'),
});

export const signupOtpVerificationSchema = z.object({
  email: z.string().email('Valid email is required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be six digits'),
});
