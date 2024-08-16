/*
  Warnings:

  - You are about to drop the column `emo_num` on the `Emoticon` table. All the data in the column will be lost.
  - Added the required column `emoNum` to the `Emoticon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Emoticon" DROP COLUMN "emo_num",
ADD COLUMN     "emoNum" INTEGER NOT NULL;
