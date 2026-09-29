import { Router } from 'express';
import { MailboxController } from '../controllers/mailbox.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { connectSmtpSchema, mailboxOAuthCallbackSchema } from '../schemas/mailbox.schema.js';

const router = Router();

// Protect all mailbox routes with user authentication
router.use(requireAuth);

router.get('/google/connect', MailboxController.connectGoogle);
router.get('/google/callback', validate(mailboxOAuthCallbackSchema, 'query'), MailboxController.googleCallback);
router.post('/smtp', validate(connectSmtpSchema, 'body'), MailboxController.connectSmtp);

export default router;
