CREATE TYPE "MailboxType" AS ENUM ('GMAIL_OAUTH', 'SMTP');
CREATE TYPE "MailboxStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'RATE_LIMITED', 'ERROR');

CREATE TABLE "mailboxes" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "type" "MailboxType" NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "providerAccountId" TEXT,
    "encryptedCredentials" TEXT NOT NULL,
    "status" "MailboxStatus" NOT NULL DEFAULT 'ACTIVE',
    "dailyCap" INTEGER NOT NULL DEFAULT 500,
    "sentTodayCount" INTEGER NOT NULL DEFAULT 0,
    "lastVerifiedAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailboxes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mailboxes_workspaceId_email_key" ON "mailboxes"("workspaceId", "email");
CREATE UNIQUE INDEX "mailboxes_workspaceId_providerAccountId_key" ON "mailboxes"("workspaceId", "providerAccountId");
CREATE INDEX "mailboxes_workspaceId_idx" ON "mailboxes"("workspaceId");
CREATE INDEX "mailboxes_workspaceId_status_idx" ON "mailboxes"("workspaceId", "status");

ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
