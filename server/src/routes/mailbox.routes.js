import { Router } from 'express';
import { mailboxController } from '../controllers/mailbox.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  mailboxConnectRateLimit,
  mailboxOAuthRateLimit,
  mailboxTestRateLimit,
} from '../middlewares/rateLimit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  connectSmtpSchema,
  discoverMailboxSchema,
  mailboxIdParamSchema,
  mailboxOAuthCallbackSchema,
} from '../schemas/mailbox.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', mailboxController.list.bind(mailboxController));
router.post(
  '/discover',
  mailboxConnectRateLimit,
  validate(discoverMailboxSchema, 'body'),
  mailboxController.discover.bind(mailboxController)
);
router.get(
  '/google/connect',
  mailboxConnectRateLimit,
  mailboxController.connectGoogle.bind(mailboxController)
);
router.get(
  '/google/callback',
  mailboxOAuthRateLimit,
  validate(mailboxOAuthCallbackSchema, 'query'),
  mailboxController.googleCallback.bind(mailboxController)
);
router.post(
  '/smtp',
  mailboxConnectRateLimit,
  validate(connectSmtpSchema, 'body'),
  mailboxController.connectSmtp.bind(mailboxController)
);
router.post(
  '/:mailboxId/disconnect',
  validate(mailboxIdParamSchema, 'params'),
  mailboxController.disconnect.bind(mailboxController)
);
router.post(
  '/:mailboxId/test',
  validate(mailboxIdParamSchema, 'params'),
  mailboxTestRateLimit,
  mailboxController.test.bind(mailboxController)
);

export default router;
