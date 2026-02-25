import { createClient } from "@libsql/client";
import { getRequiredEnv } from "./env.mjs";

const url = getRequiredEnv("DATABASE_URL");
const authToken = getRequiredEnv("DATABASE_AUTH_TOKEN");

export const db = createClient({
  url,
  authToken
});

export async function upsertLessonStatus(courseSlug, lessonId, enabled, updatedBy = null) {
  await db.execute({
    sql: `
      INSERT INTO lesson_visibility (course_slug, lesson_id, enabled, updated_at, updated_by)
      VALUES (?, ?, ?, datetime('now'), ?)
      ON CONFLICT(course_slug, lesson_id) DO UPDATE SET
        enabled = excluded.enabled,
        updated_at = datetime('now'),
        updated_by = excluded.updated_by
    `,
    args: [courseSlug, lessonId, enabled ? 1 : 0, updatedBy]
  });
}

export async function getLessonStatuses(courseSlug) {
  const result = await db.execute({
    sql: `
      SELECT lesson_id, enabled, updated_at, updated_by
      FROM lesson_visibility
      WHERE course_slug = ?
      ORDER BY lesson_id ASC
    `,
    args: [courseSlug]
  });

  return result.rows.map((row) => ({
    lessonId: String(row.lesson_id),
    enabled: Number(row.enabled) === 1,
    updatedAt: String(row.updated_at),
    updatedBy: row.updated_by ? String(row.updated_by) : null
  }));
}
