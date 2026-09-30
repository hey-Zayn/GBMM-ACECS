import { prisma } from '../src/config/prisma.js';
import { encryptSecret } from '../src/utils/crypto.js';

const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';
const DEMO_WORKSPACE_ID = '00000000-0000-4000-8000-000000000002';
const EMPTY_WORKSPACE_ID = '00000000-0000-4000-8000-000000000003';
const ACTIVE_MAILBOX_ID = '00000000-0000-4000-8000-000000000004';
const RATE_LIMITED_MAILBOX_ID = '00000000-0000-4000-8000-000000000005';

assertSeedIsAllowed();

try {
  await seedDemoData();
  console.log('Demo mailbox seed completed. No provider credentials or sessions were created.');
} finally {
  await prisma.$disconnect();
}

async function seedDemoData() {
  await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { id: DEMO_USER_ID },
      update: { email: 'demo@acme.test', displayName: 'Demo User', avatarUrl: null },
      create: { id: DEMO_USER_ID, normalizedEmail: 'demo@acme.test', email: 'demo@acme.test', displayName: 'Demo User' },
    });
    const demoWorkspace = await transaction.workspace.upsert({
      where: { id: DEMO_WORKSPACE_ID },
      update: { name: 'Acme Outreach' },
      create: { id: DEMO_WORKSPACE_ID, name: 'Acme Outreach' },
    });
    const emptyWorkspace = await transaction.workspace.upsert({
      where: { id: EMPTY_WORKSPACE_ID },
      update: { name: 'Empty Workspace' },
      create: { id: EMPTY_WORKSPACE_ID, name: 'Empty Workspace' },
    });

    await transaction.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: demoWorkspace.id, userId: user.id } },
      update: { role: 'OWNER' },
      create: { workspaceId: demoWorkspace.id, userId: user.id, role: 'OWNER' },
    });
    await transaction.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: emptyWorkspace.id, userId: user.id } },
      update: { role: 'MEMBER' },
      create: { workspaceId: emptyWorkspace.id, userId: user.id, role: 'MEMBER' },
    });

    await upsertMailbox(transaction, ACTIVE_MAILBOX_ID, {
      workspaceId: demoWorkspace.id, email: 'sender@acme.test', displayName: 'Acme Demo Sender', status: 'ACTIVE', dailyCap: 500, sentTodayCount: 42, lastErrorCode: null,
    });
    await upsertMailbox(transaction, RATE_LIMITED_MAILBOX_ID, {
      workspaceId: demoWorkspace.id, type: 'SMTP', email: 'backup@acme.test', displayName: 'Acme Backup Sender', status: 'RATE_LIMITED', dailyCap: 250, sentTodayCount: 250, lastErrorCode: 'PROVIDER_RATE_LIMITED',
    });
  });
}

async function upsertMailbox(transaction, id, overrides) {
  const fixture = createMailboxFixture(overrides);
  await transaction.mailbox.upsert({
    where: { id },
    update: fixture,
    create: { id, ...fixture },
  });
}

function createMailboxFixture(overrides = {}) {
  return {
    type: 'GMAIL_OAUTH',
    email: 'sender@acme.test',
    displayName: 'Acme Demo Sender',
    providerAccountId: null,
    encryptedCredentials: encryptSecret(JSON.stringify({ fixture: true, nonSendable: true })),
    status: 'ACTIVE',
    dailyCap: 500,
    sentTodayCount: 0,
    lastVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
    lastErrorCode: null,
    ...overrides,
  };
}

function assertSeedIsAllowed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seed is disabled in production.');
  }
  if (process.env.SEED_DEMO_DATA !== 'true') {
    throw new Error('Set SEED_DEMO_DATA=true to run the demo seed.');
  }
}
