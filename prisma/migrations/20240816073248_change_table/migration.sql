/*
  Warnings:

  - You are about to drop the `Emoticon` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nickname]` on the table `Study` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Emoticon" DROP CONSTRAINT "Emoticon_study_id_fkey";

-- AlterTable
ALTER TABLE "Habit" ALTER COLUMN "deleted" SET DEFAULT false;

-- DropTable
DROP TABLE "Emoticon";

-- CreateTable
CREATE TABLE "Emoji" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "emoNum" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emoji_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Study_nickname_key" ON "Study"("nickname");

-- AddForeignKey
ALTER TABLE "Emoji" ADD CONSTRAINT "Emoji_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;
