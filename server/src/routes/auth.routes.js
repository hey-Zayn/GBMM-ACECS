import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { googleCallbackQuerySchema } from '../schemas/auth.schema.js';
import {
  loginRateLimit,
  oauthCallbackRateLimit,
  logoutRateLimit,
} from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.get('/google', loginRateLimit, authController.googleLogin.bind(authController));
router.get(
  '/google/callback',
  oauthCallbackRateLimit,
  validate(googleCallbackQuerySchema, 'query'),
  authController.googleCallback.bind(authController)
);
router.post('/logout', logoutRateLimit, authController.logout.bind(authController));

router.get('/me', requireAuth, authController.me.bind(authController));

export default router;
