import { readFileSync } from "node:fs";

const mode = process.argv[2];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const includes = (source, values, label) => {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label}: missing ${value}`);
  }
};

if (mode === "schema") {
  const schema = read("db/schema.ts");
  const migration = read("migrations-geokenistik/0002_course_final_assessment.sql");
  includes(schema, ["isFinalAssessment", "passScore", "lessons_final_assessment_idx"], "schema");
  includes(migration, ["is_final_assessment", "pass_score", "lessons_final_assessment_idx"], "migration");
  console.log("final assessment schema verification passed");
} else if (mode === "teacher") {
  const actions = read("app/teacher/courses/final-actions.ts");
  const editor = read("app/teacher/courses/[courseId]/final/page.tsx");
  const courseEditor = read("app/teacher/courses/[courseId]/page.tsx");
  includes(actions, ["defaultTasks", "total !== 10", "createFinalAssessment", "updateFinalAssessment"], "teacher actions");
  includes(editor, ["AssignmentBuilder", "Жалпы балл", "isPublished"], "final editor");
  includes(courseEditor, ["Қорытынды тапсырма", "/final"], "course editor entry");
  console.log("final assessment teacher flow verification passed");
} else if (mode === "student") {
  const page = read("app/courses/[slug]/final/page.tsx");
  const actions = read("app/courses/actions.ts");
  const course = read("app/courses/[slug]/page.tsx");
  includes(page, ["completed.length !== learningLessons.length", "StudentAssignments", "getFinalAssessmentResult"], "student final page");
  includes(actions, ["isFinalAssessment", "syncFinalAssessmentCompletion"], "student submission");
  includes(course, ["finalUnlocked", "/final", "Барлық сабақ аяқталғаннан кейін ашылады"], "course final entry");
  console.log("final assessment student flow verification passed");
} else if (mode === "reporting") {
  const reviews = read("app/teacher/reviews/actions.ts");
  const profile = read("app/profile/page.tsx");
  const statistics = read("app/teacher/statistics/page.tsx");
  includes(reviews, ["isFinalAssessment", "syncFinalAssessmentCompletion"], "manual review");
  includes(profile, ["finalResults", "Қорытынды бағалау"], "student profile");
  includes(statistics, ["finalScore", "finalPassed", "Қорытынды"], "teacher statistics");
  console.log("final assessment reporting verification passed");
} else {
  throw new Error("Use schema, teacher, student, or reporting mode");
}
