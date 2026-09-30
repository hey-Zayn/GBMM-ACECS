CREATE TYPE "EmailOtpPurpose" AS ENUM ('LOGIN', 'SIGNUP');

ALTER TABLE "email_otp_challenges"
ADD COLUMN "purpose" "EmailOtpPurpose" NOT NULL DEFAULT 'LOGIN',
ADD COLUMN "displayName" TEXT;

CREATE INDEX "email_otp_challenges_email_purpose_createdAt_idx"
ON "email_otp_challenges"("email", "purpose", "createdAt");
