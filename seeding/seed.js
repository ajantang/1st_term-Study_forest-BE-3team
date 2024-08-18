import { PrismaClient } from "@prisma/client";
import { Studies, Emojis, Habits, HabitSuccessDates } from "./mockData.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.study.deleteMany();
  await prisma.study.createMany({
    data: Studies,
  });
  await prisma.emoji.deleteMany();
  await prisma.emoji.createMany({
    data: Emojis,
  });
  await prisma.habit.deleteMany();
  await prisma.habit.createMany({
    data: Habits,
  });
  await prisma.habitSuccessDate.deleteMany();
  await prisma.habitSuccessDate.createMany({
    data: HabitSuccessDates,
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
