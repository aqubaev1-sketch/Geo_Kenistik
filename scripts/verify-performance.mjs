import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const mode = process.argv[2];
const read = (file) => readFileSync(resolve(process.cwd(), file), "utf8");
const expect = (condition, message) => { if (!condition) throw new Error(message); };

if (mode === "indexes") {
  const schema = read("db/schema.ts");
  const migration = read("migrations/0004_performance_indexes.sql");
  const names = ["session_user_id_idx","account_user_provider_idx","courses_status_published_idx","courses_teacher_updated_idx","course_sections_course_position_idx","lessons_section_published_position_idx","assignments_lesson_position_idx","enrollments_student_active_idx","lesson_progress_student_status_idx","submissions_assignment_student_time_idx","submissions_status_time_idx"];
  for (const name of names) expect(schema.includes(name) && migration.includes(name), `${name} is not synchronized`);
  expect((migration.match(/CREATE INDEX IF NOT EXISTS/g) || []).length >= 15, "performance migration is incomplete");
  console.log("database index verification passed");
} else if (mode === "delivery") {
  const cover = read("components/courses/CourseCover.tsx");
  const catalog = read("app/courses/page.tsx");
  expect(cover.includes("f_auto,q_auto,w_1200,c_limit") && cover.includes('loading="lazy"') && cover.includes('decoding="async"'), "Cloudinary delivery optimization missing");
  expect(catalog.includes("export const revalidate = 60") && !catalog.includes("force-dynamic"), "course catalog caching missing");
  console.log("delivery optimization verification passed");
} else throw new Error("Expected indexes or delivery");
