/*
  Warnings:

  - You are about to drop the column `emoNum` on the `Emoji` table. All the data in the column will be lost.
  - Added the required column `emo_num` to the `Emoji` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Study` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Emoji" DROP COLUMN "emoNum",
ADD COLUMN     "emo_num" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Study" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';
