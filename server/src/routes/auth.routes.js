import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  emailOtpRequestSchema,
  emailOtpVerificationSchema,
  googleCallbackQuerySchema,
  signupOtpRequestSchema,
  signupOtpVerificationSchema,
} from '../schemas/auth.schema.js';
import {
  loginRateLimit,
  oauthCallbackRateLimit,
} from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.get('/google', loginRateLimit, authController.googleLogin.bind(authController));
router.post(
  '/email/request-otp',
  loginRateLimit,
  validate(emailOtpRequestSchema, 'body'),
  authController.requestEmailOtp.bind(authController)
);
router.post(
  '/email/verify-otp',
  oauthCallbackRateLimit,
  validate(emailOtpVerificationSchema, 'body'),
  authController.verifyEmailOtp.bind(authController)
);
router.post(
  '/signup/request-otp',
  loginRateLimit,
  validate(signupOtpRequestSchema, 'body'),
  authController.requestSignupOtp.bind(authController)
);
router.post(
  '/signup/verify-otp',
  oauthCallbackRateLimit,
  validate(signupOtpVerificationSchema, 'body'),
  authController.verifySignupOtp.bind(authController)
);
router.get(
  '/google/callback',
  oauthCallbackRateLimit,
  validate(googleCallbackQuerySchema, 'query'),
  authController.googleCallback.bind(authController)
);
router.post('/logout', authController.logout.bind(authController));

router.get('/me', requireAuth, authController.me.bind(authController));

export default router;
