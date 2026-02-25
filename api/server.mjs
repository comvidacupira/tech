import express from "express";
import cors from "cors";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { getEnv } from "./lib/env.mjs";
import {
  createCourseLesson,
  deleteCourseLesson,
  db,
  getCourseLessons,
  getCourses,
  updateCourseLesson,
  updateLessonEnabled,
} from "./lib/db.mjs";

const app = express();
const port = Number(getEnv("API_PORT", "3080"));
const clerkSecretKey = getEnv("CLERK_SECRET_KEY");
const clerkAuthorizedParties = getEnv(
  "CLERK_AUTHORIZED_PARTIES",
  "http://127.0.0.1:4000,http://localhost:4000",
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const writeRoles = new Set(["admin", "editor"]);
const allowedRoles = new Set(["admin", "editor", "viewer"]);
const clerkClient = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null;

app.use(cors());
app.use(express.json());

function getBearerToken(req) {
  const raw = String(req.headers.authorization || "");
  if (!raw.toLowerCase().startsWith("bearer ")) return "";
  return raw.slice(7).trim();
}

function normalizeRole(value) {
  const role = String(value || "viewer").trim().toLowerCase();
  if (!role) return "viewer";
  return role;
}

async function readAuthContext(req) {
  if (!clerkSecretKey || !clerkClient) return null;
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: clerkSecretKey,
      authorizedParties: clerkAuthorizedParties,
    });

    const userId = String(payload?.sub || "").trim();
    if (!userId) return null;

    const user = await clerkClient.users.getUser(userId);
    const role = normalizeRole(user?.publicMetadata?.role);
    return { userId, role };
  } catch (error) {
    return null;
  }
}

async function requireEditorRole(req, res, next) {
  const auth = await readAuthContext(req);
  if (!auth) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  if (!writeRoles.has(auth.role)) {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }

  req.authUser = auth;
  next();
}

async function requireAdminRole(req, res, next) {
  const auth = await readAuthContext(req);
  if (!auth) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  if (auth.role !== "admin") {
    res.status(403).json({ ok: false, error: "forbidden" });
    return;
  }

  req.authUser = auth;
  next();
}

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

app.put("/api/lessons/status", requireEditorRole, async (req, res) => {
  try {
    const course = String(req.body?.course || "").trim();
    const lessonId = String(req.body?.lessonId || "").trim();
    const enabled = Boolean(req.body?.enabled);
    const updatedBy = req.authUser ? String(req.authUser.userId) : null;

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

app.get("/api/auth/me", async (req, res) => {
  const auth = await readAuthContext(req);
  if (!auth) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  res.json({ ok: true, userId: auth.userId, role: auth.role });
});

app.put("/api/admin/users/:userId/role", requireAdminRole, async (req, res) => {
  try {
    if (!clerkClient) {
      res.status(500).json({ ok: false, error: "clerk_not_configured" });
      return;
    }

    const targetUserId = String(req.params.userId || "").trim();
    const nextRole = normalizeRole(req.body?.role);

    if (!targetUserId || !allowedRoles.has(nextRole)) {
      res.status(400).json({ ok: false, error: "invalid_payload" });
      return;
    }

    const targetUser = await clerkClient.users.getUser(targetUserId);
    const previousMetadata = targetUser?.publicMetadata || {};
    const nextMetadata = { ...previousMetadata, role: nextRole };

    await clerkClient.users.updateUserMetadata(targetUserId, {
      publicMetadata: nextMetadata,
    });

    res.json({
      ok: true,
      userId: targetUserId,
      role: nextRole,
      updatedBy: req.authUser.userId,
    });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.toLowerCase().includes("not found")) {
      res.status(404).json({ ok: false, error: "user_not_found" });
      return;
    }

    res.status(500).json({ ok: false, error: "write_failed" });
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

app.post("/api/courses/:courseSlug/lessons", requireEditorRole, async (req, res) => {
  try {
    const courseSlug = String(req.params.courseSlug || "").trim();
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const videoId = extractYoutubeVideoId(req.body?.videoId);
    const updatedBy = req.authUser ? String(req.authUser.userId) : null;
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

app.put("/api/courses/:courseSlug/lessons/:lessonId", requireEditorRole, async (req, res) => {
  try {
    const courseSlug = String(req.params.courseSlug || "").trim();
    const lessonId = String(req.params.lessonId || "").trim();
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const videoId = extractYoutubeVideoId(req.body?.videoId);
    const updatedBy = req.authUser ? String(req.authUser.userId) : null;
    const position = Number(req.body?.position);
    const enabled = Boolean(req.body?.enabled);

    if (!courseSlug || !lessonId || !title || !description || !videoId || !Number.isFinite(position) || position < 1) {
      res.status(400).json({ ok: false, error: "invalid_payload" });
      return;
    }

    const updated = await updateCourseLesson({
      courseSlug,
      lessonId,
      title,
      description,
      videoId,
      position,
      enabled,
      updatedBy
    });

    if (!updated) {
      res.status(404).json({ ok: false, error: "lesson_not_found" });
      return;
    }

    res.json({ ok: true, course: courseSlug, lessonId });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ ok: false, error: "lesson_conflict" });
      return;
    }

    res.status(500).json({ ok: false, error: "write_failed" });
  }
});

app.delete("/api/courses/:courseSlug/lessons/:lessonId", requireEditorRole, async (req, res) => {
  try {
    const courseSlug = String(req.params.courseSlug || "").trim();
    const lessonId = String(req.params.lessonId || "").trim();

    if (!courseSlug || !lessonId) {
      res.status(400).json({ ok: false, error: "invalid_payload" });
      return;
    }

    const deleted = await deleteCourseLesson(courseSlug, lessonId);
    if (!deleted) {
      res.status(404).json({ ok: false, error: "lesson_not_found" });
      return;
    }

    res.json({ ok: true, course: courseSlug, lessonId });
  } catch (error) {
    res.status(500).json({ ok: false, error: "write_failed" });
  }
});

app.listen(port, () => {
  console.log(`API Ativa em http://localhost:${port}`);
});
