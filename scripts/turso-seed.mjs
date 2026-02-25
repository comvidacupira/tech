import { createClient } from "@libsql/client";
import { getEnv, getRequiredEnv } from "../api/lib/env.mjs";
import { courses, lessons } from "../db/seed-data.mjs";

const url = getRequiredEnv("DATABASE_URL");
const authToken = getEnv("DATABASE_AUTH_TOKEN");
const isLocalUrl =
  url.startsWith("file:") ||
  url.startsWith("http://localhost") ||
  url.startsWith("https://localhost") ||
  url.startsWith("http://127.0.0.1") ||
  url.startsWith("https://127.0.0.1");

if (!authToken && !isLocalUrl) {
  throw new Error("DATABASE_AUTH_TOKEN obrigatoria para seed em Turso remoto.");
}

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

for (const course of courses) {
  await client.execute({
    sql: `
      INSERT INTO courses (slug, name, summary, display_order, image_url, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        summary = excluded.summary,
        display_order = excluded.display_order,
        image_url = excluded.image_url,
        updated_at = datetime('now')
    `,
    args: [
      course.slug,
      course.name,
      course.summary,
      course.displayOrder,
      course.imageUrl,
    ],
  });
}

for (const lesson of lessons) {
  const thumbnailUrl =
    "https://img.youtube.com/vi/" + lesson.videoId + "/hqdefault.jpg";
  await client.execute({
    sql: `
      INSERT INTO lessons (
        course_slug, lesson_id, title, description, video_id, thumbnail_url, position, enabled, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
      ON CONFLICT(course_slug, lesson_id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        video_id = excluded.video_id,
        thumbnail_url = excluded.thumbnail_url,
        position = excluded.position,
        updated_at = datetime('now')
    `,
    args: [
      lesson.courseSlug,
      lesson.lessonId,
      lesson.title,
      lesson.description,
      lesson.videoId,
      thumbnailUrl,
      lesson.position,
    ],
  });
}

console.log("Seed aplicado com sucesso.");
