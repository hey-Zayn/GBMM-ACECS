import prisma from '../config/prisma.js';

export function upsertUser(client, data) {
  const { normalizedEmail, ...createData } = data;
  return client.user.upsert({
    where: { normalizedEmail },
    create: data,
    update: createData,
  });
}

export function findIdentity(client, provider, providerAccountId) {
  return client.authIdentity.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
  });
}

export function createIdentity(client, data) {
  return client.authIdentity.create({ data });
}

export function findFirstMembership(client, userId) {
  return client.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export function createWorkspace(client, name) {
  return client.workspace.create({ data: { name } });
}

export function createMembership(client, data) {
  return client.workspaceMember.create({ data });
}

export function createSession(client, data) {
  return client.session.create({ data });
}

export function findValidSession(tokenHash) {
  return prisma.session.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true, workspace: true },
  });
}

export function findMembership(userId, workspaceId) {
  return prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
}

export function touchSession(tokenHash) {
  return prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { lastSeenAt: new Date() },
  });
}

export function revokeSession(tokenHash) {
  return prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function withTransaction(callback) {
  return prisma.$transaction(callback, { isolationLevel: 'Serializable' });
}
