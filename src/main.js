import express from "express";
import cors from "cors";
// import { DB_URL, PORT } from "./config.js";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import moment from "moment";

const PORT = 3000;
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

/** /study POST 스터디 생성 */

/** /study GET 스터디 목록 조회 */

/** /study/:id GET 스터디 상세 정보 */
app.get("/study/:id", async (req, res) => {
  const { id } = req.params;
  let result = null;

  const study = await prisma.study.findUnique({
    where: { id },
  });

  if (study) {
    const {
      id,
      nickname,
      study_name,
      description,
      background,
      point,
      createdAt,
    } = study;

    result = {
      id: id,
      nickname: nickname,
      study_name: study_name,
      description: description,
      background: background,
      point: point,
      createdAt: createdAt,
    };

    res.status(200);
  } else {
    res.status(404);
    result = { message: "Not Found" };
  }

  res.send(result);
});

/** /study/:id PATCH 스터디 상세 수정 */
app.patch("/study/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const editableData = ["name", "nickname", "description"];
  let result = null;

  for (item of editableData) {
    data.delete(item);
  }

  if (data.length !== 0) {
    result = { message: "Bad Request" };
  } else {
    const study = await prisma.study.update({
      where: { id },
      data: req.body,
    });

    const { id, name, nickname, description } = study;
    result = {
      id: id,
      name: name,
      nickname: nickname,
      description: description,
    };
  }

  res.send(result);
});

/** /study/:id DELETE 스터디 상세 삭제 */
app.delete("/study/:id", async (req, res) => {
  const { id } = req.params;
  let result = null;

  const study = await prisma.study.delete({ where: { id } });

  if (study) {
    const { id } = study;
    res.status(200);
    result = { id: id };
  } else {
    res.status(404);
    result = { message: "Not Found" };
  }

  res.send(result);
});

/** /study/:id/auth 비밀번호 일치 확인 */

/** /study/:id/point 집중 포인트 조회 */

/** /study/:id/habit POST 습관 생성 */

/** /study/:id/habitList GET 습관 정보 조회(성공 날짜 미포함) */

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
          Habit_Success_Date: { where: { createdAt: { gte: oneWeekAgo } } },
        },
      },
    },
  });

  if (habit) {
    const { id, Habit } = habit;

    const habits = Habit.map((item) => {
      const { id, name, deleted, Habit_Success_Date } = item;
      const success = Habit_Success_Date.map((date) => {
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
  }

  res.send(result);
});

/** /habit/:id PATCH 습관 이름 변경 */

/** /habit/:id/delete PATCH 습관 삭제 */

/** /habit/:id/success POST 완료한 습관 추가 */

/** /habit/:id/success DELETE 완료된 습관 취소 */

/** /study/:id/emoticon GET 응원 이모지 조회 */

/** /study/:id/emoticon 미정 응원 이모지 추가 */

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
