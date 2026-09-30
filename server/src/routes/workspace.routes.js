import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createWorkspaceSchema, workspaceIdParamSchema } from '../schemas/workspace.schema.js';

const router = Router();

router.use(requireAuth);
router.get('/', workspaceController.list.bind(workspaceController));
router.post('/', validate(createWorkspaceSchema, 'body'), workspaceController.create.bind(workspaceController));
router.post('/:workspaceId/switch', validate(workspaceIdParamSchema, 'params'), workspaceController.switch.bind(workspaceController));

export default router;
