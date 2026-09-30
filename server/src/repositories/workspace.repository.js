import prisma from '../config/prisma.js';

export function findUserWorkspaces(userId) {
  return prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
}

export function findWorkspaceMembership(client, userId, workspaceId) {
  const database = client || prisma;
  return database.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    include: { workspace: true },
  });
}

export function createWorkspace(client, name) {
  return client.workspace.create({ data: { name } });
}

export function createWorkspaceMembership(client, data) {
  return client.workspaceMember.create({ data });
}

export function updateSessionWorkspace(client, sessionId, userId, workspaceId) {
  const database = client || prisma;
  return database.session.updateMany({
    where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { workspaceId },
  });
}
