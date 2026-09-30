import { workspaceService } from '../services/workspace.service.js';

export class WorkspaceController {
  async list(req, res, next) {
    try {
      const data = await workspaceService.listWorkspaces(req.user.userId, req.user.workspaceId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const workspace = await workspaceService.createWorkspace(
        req.user.userId,
        req.user.sessionId,
        req.body.name
      );
      res.status(201).json({ success: true, data: { workspace } });
    } catch (error) {
      next(error);
    }
  }

  async switch(req, res, next) {
    try {
      const workspace = await workspaceService.switchWorkspace(
        req.user.userId,
        req.user.sessionId,
        req.params.workspaceId
      );
      res.status(200).json({ success: true, data: { workspace } });
    } catch (error) {
      next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();
