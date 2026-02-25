import express from "express";
import cors from "cors";
import { getEnv } from "./lib/env.mjs";
import {
  createCourseLesson,
  db,
  getCourseLessons,
  getCourses,
  updateLessonEnabled,
} from "./lib/db.mjs";

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

    const lessons = (await getCourseLessons(course)).map((lesson) => ({
      lessonId: lesson.lessonId,
      enabled: lesson.enabled,
      updatedAt: lesson.updatedAt,
      updatedBy: lesson.updatedBy,
    }));
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

    const updated = await updateLessonEnabled(
      course,
      lessonId,
      enabled,
      updatedBy,
    );
    if (!updated) {
      res.status(404).json({ ok: false, error: "lesson_not_found" });
      return;
    }

    res.json({ ok: true, course, lessonId, enabled });
  } catch (error) {
    res.status(500).json({ ok: false, error: "write_failed" });
  }
});

app.get("/api/courses", async (_req, res) => {
  try {
    const courses = await getCourses();
    res.json({ ok: true, courses });
  } catch (error) {
    res.status(500).json({ ok: false, error: "read_failed" });
  }
});

app.get("/api/courses/:courseSlug/lessons", async (req, res) => {
  try {
    const courseSlug = String(req.params.courseSlug || "").trim();
    if (!courseSlug) {
      res.status(400).json({ ok: false, error: "course_required" });
      return;
    }

    const lessons = await getCourseLessons(courseSlug);
    res.json({ ok: true, course: courseSlug, lessons });
  } catch (error) {
    res.status(500).json({ ok: false, error: "read_failed" });
  }
});

function slugifyLessonId(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function extractYoutubeVideoId(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";

  const simpleIdMatch = value.match(/^[A-Za-z0-9_-]{11}$/);
  if (simpleIdMatch) return value;

  try {
    const parsed = new URL(value);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
    }

    const queryId = parsed.searchParams.get("v");
    if (queryId && /^[A-Za-z0-9_-]{11}$/.test(queryId)) {
      return queryId;
    }

    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const embedIndex = pathParts.indexOf("embed");
    if (embedIndex >= 0 && pathParts[embedIndex + 1] && /^[A-Za-z0-9_-]{11}$/.test(pathParts[embedIndex + 1])) {
      return pathParts[embedIndex + 1];
    }
  } catch (error) {
    return "";
  }

  return "";
}

app.post("/api/courses/:courseSlug/lessons", async (req, res) => {
  try {
    const courseSlug = String(req.params.courseSlug || "").trim();
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const videoId = extractYoutubeVideoId(req.body?.videoId);
    const updatedBy = req.body?.updatedBy ? String(req.body.updatedBy).trim() : null;
    const requestedLessonId = String(req.body?.lessonId || "").trim();
    const lessonId = requestedLessonId || slugifyLessonId(title);
    const positionRaw = req.body?.position;
    const position = Number.isFinite(Number(positionRaw)) && Number(positionRaw) > 0
      ? Number(positionRaw)
      : null;
    const enabled = req.body?.enabled === undefined ? true : Boolean(req.body.enabled);

    if (!courseSlug || !title || !description || !videoId || !lessonId) {
      res.status(400).json({ ok: false, error: "invalid_payload" });
      return;
    }

    const lesson = await createCourseLesson({
      courseSlug,
      lessonId,
      title,
      description,
      videoId,
      position,
      enabled,
      updatedBy
    });

    res.status(201).json({ ok: true, course: courseSlug, lesson });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ ok: false, error: "lesson_conflict" });
      return;
    }

    res.status(500).json({ ok: false, error: "write_failed" });
  }
});

app.listen(port, () => {
  console.log(`API Ativa em http://localhost:${port}`);
});
