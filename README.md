{3팀}
==========
(팀 협업 문서 링크 게시)

팀원 구성

이진우 ([개인 Github 링크](https://github.com/ajantang))

박성현 ([개인 Github 링크](https://github.com/wxy0415))

송영섭 ([개인 Github 링크](https://github.com/songyoungsub))

이율리 ([개인 Github 링크](https://github.com/yoorli))

# 프로젝트 소개

성취감을 통해 공부의 습관을 정착시킬 수 있는 개인 공부 관리 및 커뮤니티 서비스 사이트 제작


프로젝트 기간: 2024.08.13 ~ 2024.09.03

## 기술 스택

Frontend: JavaScript, React.js, scss

Backend: Express.js, PrismaORM

Database: PostgreSQL

공통 Tool: Git & Github, Discord

## 배포 주소

(배포 주소 통합 전)

## 팀원별 구현 기능 상세

### 이진우

상세 스터디 조회 API   
(API 상세 명세 주소: https://www.notion.so/study-id-GET-c75fa54e8f1042468c5de6e3696d5cc4)

상세 스터디 수정 API   
(API 상세 명세 주소: https://www.notion.so/1b7096453bc3443dbaa3e3ce238f4778?pvs=25)

상세 스터디 삭제 API   
(API 상세 명세 주소: https://www.notion.so/study-id-DELETE-05b23e87e88d46038a61c90420003848)

비밀번호 일치 확인 API   
(API 상세 명세 주소: https://www.notion.so/study-id-auth-POST-1ff5c059e5b945c190093f1d7023e486)

습관 데이터 조회 API   
(API 상세 명세 주소: https://www.notion.so/study-id-habitData-GET-97979e145acb40759a05eae1dc59de57)

응원 이모지 조회 API   
(API 상세 명세 주소: https://www.notion.so/study-id-emoji-GET-e4cb37bc95c244299a62a0a0f8515133)

응원 이모지 추가 API   
(API 상세 명세 주소: https://www.notion.so/study-id-emoji-PUT-1f82404b7ce64df29dd8bdeec8b79c61)

### 박성현

스터디 생성 API    
(API 상세 명세 주소: https://www.notion.so/study-POST-f0deb7d57ddc4ea3aedbac1afa43d258)

스터디 목록 조회 API   
(API 상세 명세 주소: https://www.notion.so/12712b1b4ef74a08b6efa88d3880556c?pvs=25)

상세 스디 조회 API   
(API 상세 명세 주소: https://www.notion.so/study-id-GET-c75fa54e8f1042468c5de6e3696d5cc4)

### 송영섭

습관 생성 API   
(API 상세 명세 주소: https://www.notion.so/study-id-habits-POST-d25cc4055b8f40639b288f1f88e3d8fc?pvs=21)

습관 이름 변경 API   
(API 상세 명세 주소: https://www.notion.so/habit-id-delete-PATCH-cd7aacf975e24c98bc5924c6e2eb826f)

습관 삭제 APi   
(API 상세 명세 주소: https://www.notion.so/habit-id-delete-PATCH-cd7aacf975e24c98bc5924c6e2eb826f)

습관 리스트 조회 API   
(API 상세 명세 주소: https://www.notion.so/study-id-habitList-GET-9b50669ecb014cf490118c502ef02a53)

완료한 습관 추가 API   
(API 상세 명세 주소: https://www.notion.so/habits-id-habitSuceessed-POST-fc4249b716394795beb3561e6a4038a0?pvs=21)

완료한 습관 취소 API   
(API 상세 명세 주소: https://www.notion.so/HabitSuccessed-id-DELETE-09b875a41ba8439db5d123a74a6341de?pvs=21)

### 이율리

상세 스터디 수정 API   
(API 상세 명세 주소: https://www.notion.so/1b7096453bc3443dbaa3e3ce238f4778?pvs=25)

## Schema

### Study

  id          String   @id @default(uuid())   
  nickname    String   @unique @db.VarChar(12)   
  studyName   String   @map("study_name") @db.VarChar(20)   
  description String   @default("") @db.VarChar(100)   
  background  String   @db.VarChar(100)   
  password    String   @db.VarChar(24)   
  point       Int      @default(0)   
  createdAt   DateTime @default(now())   
  updatedAt   DateTime @updatedAt   
  Emojis      Emoji[]   
  Habits      Habit[]   

### Emoji

  id        String   @id @default(uuid())
  Study     Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  studyId   String   @map("study_id")
  emojiCode String   @map("emoji_code") @db.VarChar(49)
  count     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

### Habit

  id                String             @id @default(uuid())
  Study             Study              @relation(fields: [studyId], references: [id], onDelete: Cascade)
  studyId           String             @map("study_id")
  name              String             @db.VarChar(30)
  deleted           Boolean            @default(false)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  HabitSuccessDates HabitSuccessDate[]

### HabitSuccessDate

  id        String   @id @default(uuid())
  Habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  habitId   String   @map("habit_id")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt


## 파일 구조

```bash
root
├── http
│   ├── emoji.http
│   ├── habit.http
│   ├── study.http
│   └── success,http
├── prisma
│   ├── migrations
│   │   ├── 20240818102844_init
│   │   ├── 20240822225911_edit_emoji_column
│   │   └── migration_lock.toml
│   └── schema.prisma
├── seeding
│   ├── mock.js
│   └── seed.js
├── src
│   ├── structs
│   │   ├── emoji
│   │   │   └── emoji.js
│   │   ├── habit
│   │   │   └── Habit.js
│   │   └── study
│   │       └── Study.js
│   └── utils
│       └── asyncErrorHandler.js
├── main.js
├── package-lock.json
└── package.json
``` 
