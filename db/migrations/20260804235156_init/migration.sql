/*
  Warnings:

  - You are about to drop the `crafts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `surename` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "surename" TEXT NOT NULL;

-- DropTable
DROP TABLE "crafts";
