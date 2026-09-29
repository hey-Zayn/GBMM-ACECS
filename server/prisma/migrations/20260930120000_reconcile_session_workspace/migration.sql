ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "workspaceId" UUID;

WITH first_membership AS (
  SELECT DISTINCT ON ("userId") "userId", "workspaceId"
  FROM "workspace_members"
  ORDER BY "userId", "createdAt", "id"
)
UPDATE "sessions" AS session
SET "workspaceId" = membership."workspaceId"
FROM first_membership AS membership
WHERE session."userId" = membership."userId"
  AND session."workspaceId" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "sessions" WHERE "workspaceId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot reconcile sessions without workspace membership';
  END IF;
END $$;

ALTER TABLE "sessions" ALTER COLUMN "workspaceId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "sessions_workspaceId_idx" ON "sessions"("workspaceId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sessions_workspaceId_fkey'
  ) THEN
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_workspaceId_fkey"
      FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
