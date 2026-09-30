import { ForbiddenError } from '../utils/errors.js';
import {
  createWorkspace,
  createWorkspaceMembership,
  findUserWorkspaces,
  findWorkspaceMembership,
  updateSessionWorkspace,
} from '../repositories/workspace.repository.js';
import { withTransaction } from '../repositories/auth.repository.js';

export class WorkspaceService {
  async listWorkspaces(userId, currentWorkspaceId) {
    const memberships = await findUserWorkspaces(userId);
    return {
      currentWorkspaceId,
      workspaces: memberships.map(toWorkspaceSummary),
    };
  }

  async createWorkspace(userId, sessionId, name) {
    return withTransaction(async (transaction) => {
      const workspace = await createWorkspace(transaction, name);
      await createWorkspaceMembership(transaction, {
        workspaceId: workspace.id,
        userId,
        role: 'OWNER',
      });
      const updatedSession = await updateSessionWorkspace(transaction, sessionId, userId, workspace.id);
      if (updatedSession.count !== 1) {
        throw new ForbiddenError('Session cannot activate the new workspace');
      }
      return { id: workspace.id, name: workspace.name, role: 'OWNER' };
    });
  }

  async switchWorkspace(userId, sessionId, workspaceId) {
    return withTransaction(async (transaction) => {
      const membership = await findWorkspaceMembership(transaction, userId, workspaceId);
      if (!membership) {
        throw new ForbiddenError('You do not belong to this workspace');
      }

      const updatedSession = await updateSessionWorkspace(transaction, sessionId, userId, workspaceId);
      if (updatedSession.count !== 1) {
        throw new ForbiddenError('Session cannot switch workspaces');
      }

      return toWorkspaceSummary(membership);
    });
  }
}

export const workspaceService = new WorkspaceService();

function toWorkspaceSummary(membership) {
  return {
    id: membership.workspace.id,
    name: membership.workspace.name,
    role: membership.role,
  };
}
