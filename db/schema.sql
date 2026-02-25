CREATE TABLE IF NOT EXISTS lesson_visibility (
  course_slug TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT,
  PRIMARY KEY (course_slug, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_visibility_course ON lesson_visibility(course_slug);
