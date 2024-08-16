import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import moment from "moment";

const PORT = 3000;
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

function setStatus404(res, result) {
  res.status(404);
  result = { message: "Not Found" };
}

/** /study POST 스터디 생성 */
app.post("/study", async (req, res) => {
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
});

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

  const data = {};

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
    const { id } = study;
    res.status(204);
    result = { id: id };
    res.send(result);
  }
});

/** /study/:id/auth 비밀번호 일치 확인 */
app.post("/study/:id/auth", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const writtenPassword = password;
  let result = null;

  const study = await prisma.study.findUnique({ where: { id } });

  if (!study) {
    setStatus404(res, result);
    res.send(result);
    return;
  }

  {
    const { password } = study;

    if (writtenPassword === password) {
      result = { result: true };
    } else {
      result = { result: false };
    }
    res.status(200);
    res.send(result);
  }
});

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

/** /study/:id/habit GET 습관 정보 조회(성공 날짜 포함) */
app.get("/study/:id/habitData", async (req, res) => {
  const { id } = req.params;
  let result = null;
  const now = new Date();
  const oneWeekAgo = subDays(now, 7);

  const habit = await prisma.study.findUnique({
    where: { id },
    include: {
      Habit: {
        include: {
          HabitSuccessDate: { where: { createdAt: { gte: oneWeekAgo } } },
        },
      },
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

    const habits = Habit.map((item) => {
      const { id, name, deleted, HabitSuccessDate } = item;
      const success = HabitSuccessDate.map((date) => {
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

    res.status(200);
    result = {
      id: id,
      totalHabit: habits.length,
      habits: habits,
    };
    res.send(result);
  }
});

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

/** /study/:id/emoticon GET 응원 이모지 조회 */
app.get("/study/:id/emoji", async (req, res) => {
  const { id } = req.params;
  let result = null;

  const emoji = await prisma.study.findUnique({
    where: { id },
    include: {
      Emoticons: true,
    },
  });

  if (!emoji) {
    setStatus404(res, result);
    res.send(result);
    return;
  }

  {
    const { Emoticons } = emoji;
    const totalCount = Emoticons.length;

    const emojisData = Emoticons.map((item) => {
      const { emoNum, count } = item;
      const emojiData = { emoNum: emoNum, count: count };
      return emojiData;
    });

    res.status(200);
    result = { totalCount: totalCount, emojis: emojisData };
    res.send(result);
  }
});

/** /study/:id/emoticon 미정 응원 이모지 추가 */

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
