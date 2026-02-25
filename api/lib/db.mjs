import { createClient } from "@libsql/client";
import { getEnv, getRequiredEnv } from "./env.mjs";

const url = getRequiredEnv("DATABASE_URL");
const authToken = getEnv("DATABASE_AUTH_TOKEN");
const isLocalUrl =
  url.startsWith("file:") ||
  url.startsWith("http://localhost") ||
  url.startsWith("https://localhost") ||
  url.startsWith("http://127.0.0.1") ||
  url.startsWith("https://127.0.0.1");

if (!authToken && !isLocalUrl) {
  throw new Error("DATABASE_AUTH_TOKEN obrigatoria para Turso remoto.");
}

export const db = createClient({
  url,
  ...(authToken ? { authToken } : {})
});

export async function getCourses() {
  const result = await db.execute(`
    SELECT slug, name, summary, display_order, image_url
    FROM courses
    ORDER BY display_order ASC
  `);

  return result.rows.map((row) => ({
    slug: String(row.slug),
    name: String(row.name),
    summary: String(row.summary),
    displayOrder: Number(row.display_order),
    imageUrl: row.image_url ? String(row.image_url) : null
  }));
}

export async function getCourseLessons(courseSlug) {
  const result = await db.execute({
    sql: `
      SELECT lesson_id, title, description, video_id, thumbnail_url, position, enabled, updated_at, updated_by
      FROM lessons
      WHERE course_slug = ?
      ORDER BY position ASC
    `,
    args: [courseSlug]
  });

  return result.rows.map((row) => ({
    lessonId: String(row.lesson_id),
    title: String(row.title),
    description: String(row.description),
    videoId: String(row.video_id),
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    position: Number(row.position),
    enabled: Number(row.enabled) === 1,
    updatedAt: String(row.updated_at),
    updatedBy: row.updated_by ? String(row.updated_by) : null
  }));
}

export async function updateLessonEnabled(courseSlug, lessonId, enabled, updatedBy = null) {
  const result = await db.execute({
    sql: `
      UPDATE lessons
      SET
        enabled = ?,
        updated_at = datetime('now'),
        updated_by = ?
      WHERE course_slug = ? AND lesson_id = ?
    `,
    args: [enabled ? 1 : 0, updatedBy, courseSlug, lessonId]
  });

  return Number(result.rowsAffected || 0) > 0;
}

export async function createCourseLesson({
  courseSlug,
  lessonId,
  title,
  description,
  videoId,
  position = null,
  enabled = true,
  updatedBy = null
}) {
  let nextPosition = position;
  if (nextPosition === null || Number.isNaN(Number(nextPosition))) {
    const maxResult = await db.execute({
      sql: "SELECT COALESCE(MAX(position), 0) AS max_position FROM lessons WHERE course_slug = ?",
      args: [courseSlug]
    });
    const maxPosition = Number(maxResult.rows?.[0]?.max_position || 0);
    nextPosition = maxPosition + 1;
  }

  await db.execute({
    sql: `
      INSERT INTO lessons (
        course_slug,
        lesson_id,
        title,
        description,
        video_id,
        thumbnail_url,
        position,
        enabled,
        updated_at,
        updated_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `,
    args: [
      courseSlug,
      lessonId,
      title,
      description,
      videoId,
      "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg",
      Number(nextPosition),
      enabled ? 1 : 0,
      updatedBy
    ]
  });

  const created = await db.execute({
    sql: `
      SELECT lesson_id, title, description, video_id, thumbnail_url, position, enabled, updated_at, updated_by
      FROM lessons
      WHERE course_slug = ? AND lesson_id = ?
      LIMIT 1
    `,
    args: [courseSlug, lessonId]
  });

  const row = created.rows?.[0];
  if (!row) {
    throw new Error("lesson_create_failed");
  }

  return {
    lessonId: String(row.lesson_id),
    title: String(row.title),
    description: String(row.description),
    videoId: String(row.video_id),
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    position: Number(row.position),
    enabled: Number(row.enabled) === 1,
    updatedAt: String(row.updated_at),
    updatedBy: row.updated_by ? String(row.updated_by) : null
  };
}

export async function updateCourseLesson({
  courseSlug,
  lessonId,
  title,
  description,
  videoId,
  position,
  enabled,
  updatedBy = null
}) {
  const result = await db.execute({
    sql: `
      UPDATE lessons
      SET
        title = ?,
        description = ?,
        video_id = ?,
        thumbnail_url = ?,
        position = ?,
        enabled = ?,
        updated_at = datetime('now'),
        updated_by = ?
      WHERE course_slug = ? AND lesson_id = ?
    `,
    args: [
      title,
      description,
      videoId,
      "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg",
      Number(position),
      enabled ? 1 : 0,
      updatedBy,
      courseSlug,
      lessonId
    ]
  });

  return Number(result.rowsAffected || 0) > 0;
}

export async function deleteCourseLesson(courseSlug, lessonId) {
  const result = await db.execute({
    sql: "DELETE FROM lessons WHERE course_slug = ? AND lesson_id = ?",
    args: [courseSlug, lessonId]
  });

  return Number(result.rowsAffected || 0) > 0;
}
