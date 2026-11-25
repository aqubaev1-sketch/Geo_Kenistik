import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { db } from "@/db/drizzle";
import {
  assignments,
  courseSections,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  submissions,
} from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { findFinalAssessment, getFinalAssessmentResult } from "@/lib/final-assessment";
import { StudentAssignments } from "@/components/courses/StudentAssignments";

export default async function CourseFinalAssessmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { session } = await requireRole(["student"]);
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, slug), eq(courses.status, "published")),
  });
  if (!course) notFound();
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.courseId, course.id),
      eq(enrollments.studentId, session.user.id),
    ),
  });
  if (!enrollment) redirect(`/courses/${slug}`);
  const assessment = await findFinalAssessment(course.id);
  if (!assessment?.isPublished) notFound();
  const learningLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .where(
      and(
        eq(courseSections.courseId, course.id),
        eq(lessons.isPublished, true),
        eq(lessons.isFinalAssessment, false),
      ),
    );
  const completed = learningLessons.length
    ? await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.studentId, session.user.id),
            eq(lessonProgress.status, "completed"),
            inArray(
              lessonProgress.lessonId,
              learningLessons.map((lesson) => lesson.id),
            ),
          ),
        )
    : [];
  if (!learningLessons.length || completed.length !== learningLessons.length)
    redirect(`/courses/${slug}`);
  const tasks = await db
    .select()
    .from(assignments)
    .where(eq(assignments.lessonId, assessment.id))
    .orderBy(asc(assignments.position));
  const attempts = tasks.length
    ? await db
        .select()
        .from(submissions)
        .where(
          and(
            eq(submissions.studentId, session.user.id),
            inArray(
              submissions.assignmentId,
              tasks.map((task) => task.id),
            ),
          ),
        )
        .orderBy(desc(submissions.submittedAt))
    : [];
  const result = await getFinalAssessmentResult(course.id, session.user.id);
  const pending = Boolean(result?.pending);
  const hasResult = Boolean(result?.answered);

  return (
    <main className="container min-h-screen pb-24 pt-28">
      <Link
        href={`/courses/${slug}`}
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Курсқа қайту
      </Link>
      <div className="rounded-2xl border-2 border-black bg-[#f4ffd0] p-6 shadow-[5px_6px_0_#000] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">{course.title}</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-5xl">
              {assessment.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700">
              {assessment.summary}
            </p>
          </div>
          <div className="shrink-0 rounded-xl border-2 border-black bg-white px-5 py-4 text-center">
            <b className="block text-3xl tabular-nums text-slate-950">
              {result?.score ?? 0}/10
            </b>
            <span className="mt-1 block text-xs font-bold text-slate-600">
              Өту балы: {assessment.passScore}/10
            </span>
          </div>
        </div>
        {hasResult && (
          <div className={`mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-bold ${pending ? "border-amber-300 bg-amber-50 text-amber-800" : result?.passed ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800"}`}>
            {pending ? <Clock3 className="h-5 w-5" /> : result?.passed ? <CheckCircle2 className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
            {pending
              ? "Ашық жауап мұғалімнің тексеруін күтеді."
              : result?.passed
                ? "Құттықтаймыз! Курс сәтті аяқталды."
                : "Өту балы жиналмады. Жауаптарды қайта орындауға болады."}
          </div>
        )}
      </div>
      <StudentAssignments
        courseId={course.id}
        slug={slug}
        lessonId={assessment.id}
        tasks={tasks}
        attempts={attempts}
        heading="Қорытынды жұмыс тапсырмалары"
        description="Жалпы нәтиже 10 баллмен есептеледі. Қажет болса, жауаптарды қайта жіберуге болады."
      />
    </main>
  );
}
