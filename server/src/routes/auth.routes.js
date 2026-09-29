import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { googleCallbackQuerySchema } from '../schemas/auth.schema.js';

const router = Router();

// Public login routes
router.get('/google', AuthController.googleLogin);
router.get('/google/callback', validate(googleCallbackQuerySchema, 'query'), AuthController.googleCallback);
router.post('/logout', AuthController.logout);

// Protected user route
router.get('/me', requireAuth, AuthController.me);

export default router;
