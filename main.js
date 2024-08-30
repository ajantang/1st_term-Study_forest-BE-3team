import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config;
import cors from "cors";
import express from "express";
import asyncHandler from "./src/utils/asyncErrorHandler.js";
import { assert } from "superstruct";
import {
  CreateStudy,
  PatchStudy,
  Password,
} from "./src/structs/study/Study.js";
import { ValidateEmojiCode } from "./src/structs/emoji/emoji.js";
import { ValidateTimeZone } from "./src/structs/habit/Habit.js";
import { ValidationHabit } from "./src/structs/habit/Habit.js";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

function throwUnauthorized() {
  const error = new Error("Unauthorized");
  error.status = 401;
  throw error;
}

const emojiFormat = { emojiCode: true, count: true };

/** /study POST 스터디 생성 */
app.post(
  "/study",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateStudy);
    const study = await prisma.study.create({
      data: req.body,
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });

    res.status(201).send(study);
  })
);

/** /study GET 스터디 목록 조회 */
app.get(
  "/study",
  asyncHandler(async (req, res) => {
    const { page, pageSize, order = "recent", keyWord = "" } = req.query;

    let orderBy;
    switch (order) {
      case "mostPoint":
        orderBy = { point: "desc" };
        break;
      case "leastPoint":
        orderBy = { point: "asc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
    }

    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 6;
    const skipInt = (pageNum - 1) * pageSizeNum;

    const studies = await prisma.study.findMany({
      orderBy,
      skip: parseInt(skipInt),
      take: parseInt(pageSizeNum),
      where: {
        OR: [
          { studyName: { contains: keyWord } },
          { description: { contains: keyWord } },
        ],
      },
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });

    const totalCount = await prisma.study.count({
      where: {
        OR: [
          { studyName: { contains: keyWord } },
          { description: { contains: keyWord } },
        ],
      },
    });

    res.send({ totalCount, studies });
  })
);

/** /study/:id GET 스터디 상세 정보 */
app.get(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const study = await prisma.study.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });
    res.send(study);
  })
);

/** /study/:id PATCH 스터디 상세 수정 */
app.patch(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, PatchStudy);

    const study = await prisma.study.update({
      where: { id },
      data: req.body,
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });

    res.send(study);
  })
);

/** /study/:id DELETE 스터디 상세 삭제 */
app.delete(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const study = await prisma.study.delete({
      where: { id },
    });

    res.sendStatus(204);
  })
);

/** /study/:id/auth POST 비밀번호 일치 확인 */
app.post(
  "/study/:id/auth",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, Password);

    const { password } = await prisma.study.findUniqueOrThrow({
      where: { id },
    });

    if (req.body.password !== password) {
      const result = { result: false };
      res.status(200).send(result);
      return;
    }

    const result = { result: true };
    res.status(200).send(result);
  })
);

/** /study/:id/habit POST 습관 생성 */
app.post(
  "/study/:id/habit",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, ValidationHabit);
    const habit = await prisma.habit.create({
      data: {
        ...req.body,
        studyId: id,
      },
      select: {
        id: true,
        name: true,
        deleted: true,
        studyId: true,
        createdAt: true,
      },
    });

    res.status(201).send(habit);
  })
);

/** /study/:id/habitList GET 습관 정보 리스트 조회 */
app.get(
  "/study/:id/habitList",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { timeZone } = req.query;
    const decodedTimeZone = decodeURIComponent(timeZone);
    assert(decodedTimeZone, ValidateTimeZone);
    // const timeZoneString = timeZone || "Asia/Seoul";
    const now = DateTime.now().setZone(decodedTimeZone);
    const startOfDay = now.startOf("day");
    const UTCTime = startOfDay.toUTC();

    const habits = await prisma.habit.findMany({
      where: {
        studyId: id,
        deleted: false,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        deleted: true,
        studyId: true,
        createdAt: true,
        HabitSuccessDates: {
          where: {
            createdAt: {
              gte: UTCTime.toISO(),
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const totalCount = habits.length;

    const data = {
      totalCount,
      habits,
    };

    res.send(data);
  })
);

/** /study/:id/habitData GET 습관 정보 조회(최근 일주일 성공 날짜 정보 포함) */
app.get(
  "/study/:id/habitData",
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;
    const { timeZone } = req.query;
    const decodedTimeZone = decodeURIComponent(timeZone);
    assert(decodedTimeZone, ValidateTimeZone);

    const now = DateTime.now().setZone(decodedTimeZone).startOf("day");
    const startOfDayUTC = now.toUTC();
    const oneWeekAgo = startOfDayUTC.minus({ days: 6 });

    const study = await prisma.study.findUniqueOrThrow({
      where: { id: studyId },
      include: {
        Habits: {
          include: {
            HabitSuccessDates: {
              where: { createdAt: { gte: oneWeekAgo.toISO() } },
            },
          },
        },
      },
    });

    const habits = study.Habits.map((item) => {
      const { id, name, deleted, HabitSuccessDates } = item;
      const success = HabitSuccessDates.map((date) => {
        const createdAtInClientTZ = DateTime.fromJSDate(date.createdAt)
          .setZone(decodedTimeZone)
          .startOf("day");
        const diffInDays = Math.floor(
          startOfDayUTC.diff(createdAtInClientTZ, "days").days
        );

        const dayIndex = 6 - diffInDays;

        return dayIndex;
      });

      // const description = HabitSuccessDates.map((date) => {
      //   const luxondateTypeData = DateTime.fromJSDate(date.createdAt);
      //   const setTimeOfLocalTimeZone =
      //     luxondateTypeData.setZone(decodedTimeZone);
      //   const getTimeOfLocalTimeZoneStartDayTime =
      //     setTimeOfLocalTimeZone.startOf("day");
      //   const timeGapStartOfDayUTCToLocalTimeZoneStartDay = startOfDayUTC.diff(
      //     getTimeOfLocalTimeZoneStartDayTime,
      //     "days"
      //   ).days;
      //   const afterFloorDaysData = Math.floor(
      //     timeGapStartOfDayUTCToLocalTimeZoneStartDay
      //   );
      //   const dayIndex = 6 - afterFloorDaysData;

      //   const result = `luxon의 datetype 정보로 변환 : ${luxondateTypeData} \n timezone 설정 : ${setTimeOfLocalTimeZone} \n 성공일의 생성 시간을 기준으로 timezone 시간의 00시에 해당하는 시간으로 변환(해당 날짜 00시로) : ${getTimeOfLocalTimeZoneStartDayTime} \n 성공 데이터의 00시와 오늘 00시와의 날짜 차이 : ${timeGapStartOfDayUTCToLocalTimeZoneStartDay} \n floor 처리 : ${afterFloorDaysData} \n dayIndex : ${dayIndex}`;

      //   return result;
      // });

      return {
        id: id,
        name: name,
        deleted: deleted,
        success: success,
        // description: description,
      };
    });

    const result = {
      id: studyId,
      totalHabit: habits.length,
      habits: habits,
    };

    res.status(200).send(result);
  })
);

/** /habit/:id PACH 습관 이름 수정 */
app.patch(
  "/habit/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, ValidationHabit);

    const habit = await prisma.habit.update({
      where: { id },
      data: req.body,
      select: {
        id: true,
        name: true,
        deleted: true,
        createdAt: true,
      },
    });

    res.send(habit);
  })
);

/** /habit/:id/delete PACH 습관 삭제 */
app.patch(
  "/habit/:id/delete",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const habit = await prisma.habit.update({
      where: { id },
      data: { deleted: true },
      select: { id: true },
    });

    res.send(habit);
  })
);

/** /success POST 완료한 습관 추가 */
app.post(
  "/success",
  asyncHandler(async (req, res) => {
    const success = await prisma.habitSuccessDate.create({
      data: {
        ...req.body,
      },
      select: {
        id: true,
        createdAt: true,
        habitId: true,
      },
    });

    res.status(201).send(success);
  })
);

/** /success/:id DELETE 완료된 습관 취소 */
app.delete(
  "/success/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const success = await prisma.habitSuccessDate.delete({
      where: { id },
      select: {
        id: true,
        habitId: true,
      },
    });

    res.sendStatus(204);
  })
);

/** /study/:id/emoji GET 응원 이모지 조회 */
app.get(
  "/study/:id/emoji",
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;

    const study = await prisma.study.findUniqueOrThrow({
      where: { id: studyId },
      include: {
        Emojis: { orderBy: { count: "desc" }, select: emojiFormat },
      },
    });

    const totalCount = study.Emojis.length;

    const { Emojis } = study;

    const result = { totalCount: totalCount, Emojis: Emojis };
    res.status(200).send(result);
  })
);

/** /study/:id/emoji/:emojiCode PUT 미정 응원 이모지 추가 */
app.put(
  "/study/:id/emoji",
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;
    const { emojiCode } = req.body;
    assert(req.body, ValidateEmojiCode);
    const emoji = await prisma.emoji.findFirst({
      where: { studyId: studyId, emojiCode: emojiCode },
    });

    if (!emoji) {
      const data = { emojiCode: emojiCode, count: 1, studyId: studyId };
      const result = await prisma.emoji.create({
        data: data,
        select: emojiFormat,
      });
      res.status(201).send(result);
      return;
    } else {
      const data = { emojiCode: emojiCode, count: Number(emoji.count) + 1 };
      const result = await prisma.emoji.update({
        where: { id: emoji.id },
        data: data,
        select: emojiFormat,
      });
      res.status(200).send(result);
      return;
    }
  })
);

app.listen(process.env.PORT || 3000, () => console.log("Sever Started"));
