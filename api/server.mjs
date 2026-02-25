import express from "express";
import cors from "cors";
import { getEnv } from "./lib/env.mjs";
import { db, getLessonStatuses, upsertLessonStatus } from "./lib/db.mjs";

const app = express();
const port = Number(getEnv("API_PORT", "3080"));

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await db.execute("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: "database_unreachable" });
  }
});

app.get("/api/lessons/status", async (req, res) => {
  try {
    const course = String(req.query.course || "").trim();
    if (!course) {
      res.status(400).json({ ok: false, error: "course_required" });
      return;
    }

    const lessons = await getLessonStatuses(course);
    res.json({ ok: true, course, lessons });
  } catch (error) {
    res.status(500).json({ ok: false, error: "read_failed" });
  }
});

app.put("/api/lessons/status", async (req, res) => {
  try {
    const course = String(req.body?.course || "").trim();
    const lessonId = String(req.body?.lessonId || "").trim();
    const enabled = Boolean(req.body?.enabled);
    const updatedBy = req.body?.updatedBy ? String(req.body.updatedBy) : null;

    if (!course || !lessonId) {
      res.status(400).json({ ok: false, error: "course_and_lesson_required" });
      return;
    }

    await upsertLessonStatus(course, lessonId, enabled, updatedBy);
    res.json({ ok: true, course, lessonId, enabled });
  } catch (error) {
    res.status(500).json({ ok: false, error: "write_failed" });
  }
});

app.listen(port, () => {
  console.log(`API Turso ativa em http://localhost:${port}`);
});
