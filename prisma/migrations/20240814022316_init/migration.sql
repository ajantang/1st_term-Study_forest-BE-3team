-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "nickname" VARCHAR(12) NOT NULL,
    "study_name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(100),
    "background" VARCHAR(50) NOT NULL,
    "password" VARCHAR(24) NOT NULL,
    "point" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emoticons" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "emo_num" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Emoticons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit_Success_Date" (
    "id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_Success_Date_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Emoticons" ADD CONSTRAINT "Emoticons_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit_Success_Date" ADD CONSTRAINT "Habit_Success_Date_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
