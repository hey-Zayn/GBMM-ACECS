import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  mailbox: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../src/config/prisma.js', () => ({ default: prismaMock }));

const repository = await import('../../src/repositories/mailbox.repository.js');

describe('mailbox repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists only mailboxes from the requested workspace', async () => {
    prismaMock.mailbox.findMany.mockResolvedValue([]);

    await repository.listMailboxes('workspace-a');

    expect(prismaMock.mailbox.findMany).toHaveBeenCalledWith({
      where: { workspaceId: 'workspace-a' },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('finds a mailbox with both mailbox and workspace scope', async () => {
    prismaMock.mailbox.findFirst.mockResolvedValue(null);

    await repository.findMailbox('workspace-a', 'mailbox-id');

    expect(prismaMock.mailbox.findFirst).toHaveBeenCalledWith({
      where: { id: 'mailbox-id', workspaceId: 'workspace-a' },
    });
  });

  it('looks up a mailbox by workspace email for deduplication', async () => {
    prismaMock.mailbox.findFirst.mockResolvedValue(null);
    prismaMock.mailbox.findUnique = vi.fn().mockResolvedValue(null);

    await repository.findMailboxByEmail('workspace-a', 'sender@example.test');

    expect(prismaMock.mailbox.findUnique).toHaveBeenCalledWith({
      where: { workspaceId_email: { workspaceId: 'workspace-a', email: 'sender@example.test' } },
    });
  });

  it('scopes mailbox updates and deletes to the workspace', async () => {
    prismaMock.mailbox.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.mailbox.deleteMany.mockResolvedValue({ count: 1 });

    await repository.updateMailbox('workspace-a', 'mailbox-id', { status: 'DISCONNECTED' });
    await repository.deleteMailbox('workspace-a', 'mailbox-id');

    expect(prismaMock.mailbox.updateMany).toHaveBeenCalledWith({
      where: { id: 'mailbox-id', workspaceId: 'workspace-a' },
      data: { status: 'DISCONNECTED' },
    });
    expect(prismaMock.mailbox.deleteMany).toHaveBeenCalledWith({
      where: { id: 'mailbox-id', workspaceId: 'workspace-a' },
    });
  });
});
