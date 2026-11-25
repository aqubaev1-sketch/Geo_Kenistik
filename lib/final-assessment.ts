import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  assignments,
  courseSections,
  enrollments,
  lessons,
  submissions,
} from "@/db/schema";

export async function findFinalAssessment(courseId: string) {
  const [row] = await db
    .select({ lesson: lessons })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .where(
      and(
        eq(courseSections.courseId, courseId),
        eq(lessons.isFinalAssessment, true),
      ),
    )
    .limit(1);
  return row?.lesson ?? null;
}

export async function getFinalAssessmentResult(
  courseId: string,
  studentId: string,
) {
  const assessment = await findFinalAssessment(courseId);
  if (!assessment) return null;
  const tasks = await db
    .select({ id: assignments.id, maxScore: assignments.maxScore })
    .from(assignments)
    .where(eq(assignments.lessonId, assessment.id));
  if (!tasks.length)
    return {
      assessment,
      score: 0,
      maxScore: 0,
      pending: 0,
      revision: 0,
      answered: 0,
      passed: false,
    };
  const attempts = await db
    .select({
      assignmentId: submissions.assignmentId,
      status: submissions.status,
      score: submissions.score,
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.studentId, studentId),
        inArray(
          submissions.assignmentId,
          tasks.map((task) => task.id),
        ),
      ),
    )
    .orderBy(desc(submissions.submittedAt));
  const latest = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts)
    if (!latest.has(attempt.assignmentId))
      latest.set(attempt.assignmentId, attempt);
  const current = tasks.map((task) => ({ task, attempt: latest.get(task.id) }));
  const score = current.reduce(
    (sum, item) =>
      sum +
      (item.attempt?.status === "checked" ? (item.attempt.score ?? 0) : 0),
    0,
  );
  const pending = current.filter(
    (item) => item.attempt?.status === "submitted",
  ).length;
  const revision = current.filter(
    (item) => item.attempt?.status === "revision",
  ).length;
  const answered = current.filter((item) => item.attempt).length;
  const maxScore = tasks.reduce((sum, task) => sum + task.maxScore, 0);
  const passed =
    answered === tasks.length &&
    pending === 0 &&
    revision === 0 &&
    score >= assessment.passScore;
  return {
    assessment,
    score,
    maxScore,
    pending,
    revision,
    answered,
    passed,
  };
}

export async function syncFinalAssessmentCompletion(
  courseId: string,
  studentId: string,
) {
  const result = await getFinalAssessmentResult(courseId, studentId);
  if (!result?.passed) return result;
  await db
    .update(enrollments)
    .set({ completedAt: new Date(), progressPercent: 100, lastActiveAt: new Date() })
    .where(
      and(
        eq(enrollments.courseId, courseId),
        eq(enrollments.studentId, studentId),
      ),
    );
  return result;
}
