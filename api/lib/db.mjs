import { createClient } from "@libsql/client";
import { getRequiredEnv } from "./env.mjs";

const url = getRequiredEnv("DATABASE_URL");
const authToken = getRequiredEnv("DATABASE_AUTH_TOKEN");

export const db = createClient({
  url,
  authToken
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
