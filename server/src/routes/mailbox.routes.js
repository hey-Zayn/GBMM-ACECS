import { Router } from 'express';
import { mailboxController } from '../controllers/mailbox.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { connectSmtpSchema, mailboxOAuthCallbackSchema } from '../schemas/mailbox.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/google/connect', mailboxController.connectGoogle.bind(mailboxController));
router.get(
  '/google/callback',
  validate(mailboxOAuthCallbackSchema, 'query'),
  mailboxController.googleCallback.bind(mailboxController)
);
router.post(
  '/smtp',
  validate(connectSmtpSchema, 'body'),
  mailboxController.connectSmtp.bind(mailboxController)
);

export default router;
