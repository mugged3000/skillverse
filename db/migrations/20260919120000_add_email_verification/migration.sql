-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- Backfill: accounts that already existed before this feature shipped
-- pre-date email verification entirely, so grandfather them in as
-- verified. Only new signups from here on need to verify.
UPDATE "users" SET "emailVerified" = true;
