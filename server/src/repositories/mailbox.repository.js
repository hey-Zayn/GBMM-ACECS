import prisma from '../config/prisma.js';

export function listMailboxes(workspaceId) {
  return prisma.mailbox.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
  });
}

export function findMailbox(workspaceId, mailboxId) {
  return prisma.mailbox.findFirst({
    where: { id: mailboxId, workspaceId },
  });
}

export function findMailboxByEmail(workspaceId, email) {
  return prisma.mailbox.findUnique({
    where: { workspaceId_email: { workspaceId, email } },
  });
}

export function findMailboxByProviderAccountId(workspaceId, providerAccountId) {
  return prisma.mailbox.findUnique({
    where: { workspaceId_providerAccountId: { workspaceId, providerAccountId } },
  });
}

export function createMailbox(data) {
  return prisma.mailbox.create({ data });
}

export function updateMailbox(workspaceId, mailboxId, data) {
  return prisma.mailbox.updateMany({
    where: { id: mailboxId, workspaceId },
    data,
  });
}

export function deleteMailbox(workspaceId, mailboxId) {
  return prisma.mailbox.deleteMany({
    where: { id: mailboxId, workspaceId },
  });
}
