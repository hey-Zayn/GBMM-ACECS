import { Router } from 'express';
import authRoutes from './auth.routes.js';
import mailboxRoutes from './mailbox.routes.js';
import workspaceRoutes from './workspace.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/mailboxes', mailboxRoutes);
router.use('/workspaces', workspaceRoutes);

export default router;
