/*
  Warnings:

  - You are about to drop the `Emoticons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Emoticons" DROP CONSTRAINT "Emoticons_study_id_fkey";

-- DropTable
DROP TABLE "Emoticons";

-- CreateTable
CREATE TABLE "Emoticon" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "emo_num" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Emoticon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Emoticon" ADD CONSTRAINT "Emoticon_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;
