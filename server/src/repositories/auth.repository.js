import prisma from '../config/prisma.js';

export function upsertUser(client, data) {
  const { normalizedEmail, ...createData } = data;
  return client.user.upsert({
    where: { normalizedEmail },
    create: data,
    update: createData,
  });
}

export function findUserByNormalizedEmail(normalizedEmail) {
  return prisma.user.findUnique({ where: { normalizedEmail } });
}

export function findUserByNormalizedEmailInClient(client, normalizedEmail) {
  return client.user.findUnique({ where: { normalizedEmail } });
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

export function invalidateEmailOtpChallenges(client, email, purpose, now) {
  return client.emailOtpChallenge.updateMany({
    where: { email, purpose, consumedAt: null, expiresAt: { gt: now } },
    data: { consumedAt: now },
  });
}

export function createEmailOtpChallenge(client, data) {
  return client.emailOtpChallenge.create({ data });
}

export function findEmailOtpChallenge(client, email, purpose, now) {
  return client.emailOtpChallenge.findFirst({
    where: { email, purpose, consumedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
  });
}

export function incrementEmailOtpAttempts(client, id) {
  return client.emailOtpChallenge.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
}

export function consumeEmailOtpChallenge(client, id, now) {
  return client.emailOtpChallenge.updateMany({
    where: { id, consumedAt: null },
    data: { consumedAt: now },
  });
}

export function withTransaction(callback) {
  return prisma.$transaction(callback, { isolationLevel: 'Serializable' });
}
