import express from "express";
import cors from "cors";
import { PrismaClient, Prisma } from "@prisma/client";
import { assert } from "superstruct";
import { subDays } from "date-fns";
import moment from "moment";
// import asyncHandler from "express-async-handler";

import { Password } from "./src/structs/Study.js";
import { Emoji } from "./src/structs/Emoji.js";

const PORT = 3000;
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

function setStatus404(res, result) {
  res.status(404);
  result = { message: "Not Found" };
}

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.status === 401) {
        res.status(401).send({ message: "Unauthorized" });
      } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // 유니크 키 제약 위반
        if (e.code === "P2002") {
          res.status(409).send({
            message: "Unique constraint failed on the field: " + e.meta.target,
          });
        } else if (e.code === "P2025") {
          res.status(404).send({ message: "Not Found" });
        } else {
          res.status(400).send({ message: e.message });
        }
      } else if (
        e instanceof Prisma.PrismaClientValidationError ||
        e.name === "StructError"
      ) {
        res.status(400).send({ message: "Validation error: " + e.message });
      } else if (e instanceof Prisma.PrismaClientRustPanicError) {
        res
          .status(500)
          .send({ message: "Internal server error: " + e.message });
      } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
        res
          .status(500)
          .send({ message: "Unknown request error: " + e.message });
      } else if (e instanceof Prisma.PrismaClientInitializationError) {
        res.status(500).send({ message: "Initialization error: " + e.message });
      } else {
        // 기타 예외 처리
        res.status(500).send({ message: e.message });
      }
    }
  };
}

function throwUnauthorized() {
  const error = new Error("Unauthorized");
  error.status = 401;
  throw error;
}

const selectFormat = { emoNum: true, count: true };

/** /study POST 스터디 생성 */
app.post(
  "/study",
  asyncHandler(async (req, res) => {
    const { nickname, studyName, description, background, password } = req.body;
    let result = null;

    const data = {
      nickname: nickname,
      studyName: studyName,
      description: description,
      background: background,
      password: password,
    };

    const study = await prisma.study.create({ data: data });

    if (!study) {
      res.status(400); // 미정
      result = { message: "미정" };
      res.send(result);
      return;
    }

    {
      const {
        id,
        nickname,
        studyName,
        description,
        background,
        point,
        createdAt,
      } = study;

      result = {
        id: id,
        nickname: nickname,
        studyName: studyName,
        description: description,
        background: background,
        point: point,
        createdAt: createdAt,
      };

      res.status(201);
      res.send(result);
    }
  })
);

/** /study GET 스터디 목록 조회 */
app.get("/study", async (req, res) => {
  const { orderBy, offset, limit, search } = req.query;
  let result = null;
  let orderByOption = null;

  switch (orderBy) {
    case "point": {
      orderByOption = { point: desc };
      break;
    }
    case "pointless": {
      orderByOption = { point: asc };
      break;
    }
    case "oldest": {
      orderByOption = { createdAt: asc };
      break;
    }
    case "recent":
    default: {
      orderByOption = { createdAt: desc };
    }
  }

  const studies = await prisma.study.findMany({
    where: { studyName: { contains: search } },
    orderBy: orderByOption,
    skip: offset,
    take: limit,
  });

  if (!studies) {
    res.status(400); // 미정
    result = { message: "미정" };
    res.send(result);
    return;
  }

  {
    result = studies.map((item) => {
      const {
        id,
        nickname,
        studyName,
        description,
        background,
        point,
        createdAt,
      } = item;

      const shownStudy = {
        id: id,
        nickname: nickname,
        studyName: studyName,
        description: description,
        background: background,
        point: point,
        createdAt: createdAt,
      };

      return shownStudy;
    });

    res.status(200);
    res.send(reslut);
  }
});

/** /study/:id GET 스터디 상세 정보 */
app.get("/study/:id", async (req, res) => {
  const { id } = req.params;
  let result = null;

  const study = await prisma.study.findUnique({ where: { id } });

  if (!study) {
    setStatus404(res, result);
    res.send(result);
    return;
  }

  {
    const {
      id,
      nickname,
      studyName,
      description,
      background,
      point,
      createdAt,
    } = study;

    result = {
      id: id,
      nickname: nickname,
      studyName: studyName,
      description: description,
      background: background,
      point: point,
      createdAt: createdAt,
    };

    res.status(200);
    res.send(result);
  }
});

/** /study/:id PATCH 스터디 상세 수정 */
app.patch("/study/:id", async (req, res) => {
  const { id } = req.params;
  const { nickname, studyName, description, point } = req.body;
  let result = null;

  let data = {};

  if (nickname) {
    data.nickname = nickname;
  }

  if (studyName) {
    data.studyName = studyName;
  }

  if (description) {
    data.description = description;
  }

  if (point) {
    data.point = point;
  }

  res.send(data);
  return;
  const updatedStudy = await prisma.study.update({
    where: { id },
    data: data,
  });

  if (!updatedStudy) {
    res.status(400); // 미정
    result = { message: "미정" };
    res.send(result);
    return;
  }

  {
    const {
      id,
      studyName,
      nickname,
      description,
      background,
      point,
      createdAt,
    } = updatedStudy;

    result = {
      id: id,
      nickname: nickname,
      studyName: studyName,
      description: description,
      background: background,
      point: point,
      createdAt: createdAt,
    };

    res.status(200);
    res.send(result);
  }
});

/** /study/:id DELETE 스터디 상세 삭제 */
app.delete("/study/:id", async (req, res) => {
  const { id } = req.params;
  let result = null;

  const deletedStudy = await prisma.study.delete({ where: { id } });

  if (!deletedStudy) {
    res.status(404);
    result = { message: "Not Found" };
    res.send(result);
    return;
  }

  {
    const { id } = deletedStudy;
    res.status(204);
    result = { id: id };
    res.send(result);
  }
});

// 이진우 담당 API
/** /study/:id/auth 비밀번호 일치 확인 */
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

/** /study/:id/point GET-보류 집중 포인트 조회 */

/** /study/:id/habit POST 습관 생성 */
app.post("/study/:id/habit", async (req, res) => {
  const { id } = req.headers;
  const { name } = req.body;
  let result = null;
  const data = {
    studyId: id,
    name: name,
  };

  const newHabit = await prisma.habit.create({ data: data });

  if (!newHabit) {
    res.status(400); // 미정
    result = { message: "미정" };
    res.send(result);
    return;
  }

  {
    const { id, name, deleted, studyId, createdAt } = newHabit;

    result = {
      id: id,
      name: name,
      deleted: deleted,
      studyId: studyId,
      createdAt: createdAt,
    };

    res.status(200);
    res.send(result);
  }
});

/** /study/:id/habitList GET 습관 정보 조회(성공 날짜 미포함) */
app.get("/study/:id/habitList", async (req, res) => {
  const { id } = req.params;
  let result = null;

  const habit = await prisma.study.findUnique({
    where: { id },
    include: {
      Habit: true,
    },
  });

  if (!habit) {
    res.status(400); // 미정
    result = { message: "미정" };
    res.send(result);
    return;
  }

  {
    const { id, Habit } = habit;

    const totalCount = Habit.length;
    const habits = Habit.map((item) => {
      const { id, name, deleted, studyId, createdAt } = item;

      const shownHabit = {
        id: id,
        name: name,
        deleted: deleted,
        studyId: studyId,
        createdAt: createdAt,
      };

      return shownHabit;
    });

    result = {
      id: id,
      totalHabit: totalCount,
      habits: habits,
    };

    res.status(200);

    res.send(result);
  }
});

// 이진우 담당 API
/** /study/:id/habit GET 습관 정보 조회(성공 날짜 포함) */
app.get(
  "/study/:id/habitData",
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;
    const now = new Date();
    const oneWeekAgo = subDays(now, 6);

    const study = await prisma.study.findUniqueOrThrow({
      where: { id: studyId },
      include: {
        Habits: {
          include: {
            HabitSuccessDates: { where: { createdAt: { gte: oneWeekAgo } } },
          },
        },
      },
    });

    const habits = study.Habits.map((item) => {
      const { id, name, deleted, HabitSuccessDates } = item;
      const success = HabitSuccessDates.map((date) => {
        const successDay = moment(date.createdAt, "YYYY-MM-DDTHH:mm:ss.SSSZ");
        const diff =
          Math.floor(successDay.diff(now) / (1000 * 60 * 60 * 24)) + 6;

        return diff;
      });

      return {
        id: id,
        name: name,
        deleted: deleted,
        success: success,
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

/** /habit/:id PATCH 습관 이름 변경 */
app.patch("/habit/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const data = { name: name };

  const updatedHabit = await prisma.habit.update({ where: { id }, data: data });

  if (!updatedHabit) {
    setStatus404(res, result);
    res.send(result);
    return;
  }

  {
    const { id, name, deleted, createdAt } = updatedHabit;

    result = {
      id: id,
      name: name,
      deleted: deleted,
      createdAt: createdAt,
    };

    res.status(200);
    res.send(result);
  }
});

/** /habit/:id/delete PATCH 습관 삭제 */
app.patch("/habit/:id/delete", async (req, res) => {
  const { id } = req.params;
  const data = { deleted: true };

  const updatedHabit = await prisma.habit.update({ where: { id }, data: data });

  if (!updatedHabit) {
    setStatus404(res, result);
    res.send(result);
    return;
  }

  {
    const { id } = updatedHabit;

    result = {
      id: id,
    };

    res.status(200);
    res.send(result);
  }
});

/** /habit/:id/success POST 완료한 습관 추가 */

/** /habit/:id/success DELETE 완료된 습관 취소 */

// 이진우 담당 API
/** /study/:id/emoticon GET 응원 이모지 조회 */
app.get(
  "/study/:id/emoji",
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;

    const study = await prisma.study.findUniqueOrThrow({
      where: { id: studyId },
      include: {
        Emojis: { orderBy: { count: "desc" }, select: selectFormat },
      },
    });

    const totalCount = study.Emojis.length;

    // const emojisData = study.Emojis.map((item) => {
    //   const { emoNum, count } = item;
    //   const emojiData = { emoNum: emoNum, count: count };
    //   return emojiData;
    // });

    const { Emojis } = study;

    const result = { totalCount: totalCount, Emojis: Emojis };
    res.status(200).send(result);
  })
);

// 이진우 담당 API
/** /study/:id/emoticon 미정 응원 이모지 추가 */
app.put(
  "/study/:id/emoji/:emojiNum",
  asyncHandler(async (req, res) => {
    const { id: studyId, emojiNum } = req.params;
    const castedEmoNum = Number(emojiNum);
    const emoji = await prisma.emoji.findFirst({
      where: { studyId: studyId, emoNum: castedEmoNum },
    });

    if (!emoji) {
      const data = { emoNum: castedEmoNum, count: 1, studyId: studyId };
      const result = await prisma.emoji.create({
        data: data,
        select: selectFormat,
      });
      res.status(201).send(result);
      return;
    } else {
      const data = { emoNum: castedEmoNum, count: Number(emoji.count) + 1 };
      const result = await prisma.emoji.update({
        where: { id: emoji.id },
        data: data,
        select: selectFormat,
      });
      res.status(200).send(result);
      return;
    }
  })
);

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
