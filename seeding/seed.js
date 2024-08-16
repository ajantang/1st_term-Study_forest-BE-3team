import { PrismaClient } from "@prisma/client";
import { Studies, Emoticons, Habits, Habit_Success_Dates } from "./mockData.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.study.deleteMany();
  await prisma.study.createMany({
    data: Studies,
  });
  await prisma.emoticon.deleteMany();
  await prisma.emoticon.createMany({
    data: Emoticons,
  });
  await prisma.habit.deleteMany();
  await prisma.habit.createMany({
    data: Habits,
  });
  await prisma.habitSuccessDate.deleteMany();
  await prisma.habitSuccessDate.createMany({
    data: Habit_Success_Dates,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log(err.name);
    await prisma.$disconnect();
    process.exit(1);
  });
