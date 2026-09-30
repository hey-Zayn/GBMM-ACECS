CREATE TABLE "email_otp_challenges" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_otp_challenges_email_createdAt_idx"
ON "email_otp_challenges"("email", "createdAt");

CREATE INDEX "email_otp_challenges_expiresAt_idx"
ON "email_otp_challenges"("expiresAt");
