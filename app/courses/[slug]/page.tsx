import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { CheckCircle2, Circle, GraduationCap, Lock, PlayCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import {
  courseSections,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  mediaAssets,
} from "@/db/schema";
import { startCourse } from "../actions";
import { ActionSubmitButton } from "@/components/ui/action-submit-button";
import { findFinalAssessment, getFinalAssessmentResult } from "@/lib/final-assessment";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ completed?: string }>;
}) {
  const { slug } = await params;
  const { completed: finished } = await searchParams;
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, slug), eq(courses.status, "published")),
  });
  if (!course) notFound();
  const cover = course.coverMediaId
    ? await db.query.mediaAssets.findFirst({
        where: eq(mediaAssets.id, course.coverMediaId),
      })
    : null;
  const sections = await db.query.courseSections.findMany({
    where: eq(courseSections.courseId, course.id),
    orderBy: [asc(courseSections.position)],
    with: {
      lessons: {
        where: and(eq(lessons.isPublished, true), eq(lessons.isFinalAssessment, false)),
        orderBy: [asc(lessons.position)],
      },
    },
  });
  const allLessons = sections.flatMap((section) => section.lessons);
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  const enrollment =
    session?.user.role === "student"
      ? await db.query.enrollments.findFirst({
          where: and(
            eq(enrollments.courseId, course.id),
            eq(enrollments.studentId, session.user.id),
          ),
        })
      : null;
  const progress =
    enrollment && allLessons.length
      ? await db
          .select({
            lessonId: lessonProgress.lessonId,
            status: lessonProgress.status,
          })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.studentId, session!.user.id),
              inArray(
                lessonProgress.lessonId,
                allLessons.map((item) => item.id),
              ),
            ),
          )
      : [];
  const completedIds = new Set(
    progress
      .filter((item) => item.status === "completed")
      .map((item) => item.lessonId),
  );
  const finalAssessment = await findFinalAssessment(course.id);
  const finalResult =
    enrollment && finalAssessment?.isPublished
      ? await getFinalAssessmentResult(course.id, session!.user.id)
      : null;
  const finalUnlocked =
    Boolean(enrollment) &&
    allLessons.length > 0 &&
    completedIds.size === allLessons.length;
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 to-blue-600 text-white">
        {cover?.publicUrl && (
          <img
            src={cover.publicUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={`absolute inset-0 ${cover?.publicUrl ? "bg-slate-950/65" : "bg-transparent"}`}
        />
        <div className="relative p-8 sm:p-12">
          <p className="text-sm font-semibold text-white/80">
            10-сынып · қазақ тілінде
          </p>
          <h1 className="mt-3 max-w-3xl break-words text-4xl font-bold tracking-[-.04em] sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/90">
            {course.description}
          </p>
        </div>
      </div>
      {finished === "1" && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
          Құттықтаймыз! Курстың барлық жарияланған сабақтарын аяқтадыңыз.
        </div>
      )}
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Курс мазмұны</h2>
          <div className="mt-5 space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={section.id}>
                <h3 className="mb-3 text-sm font-bold text-slate-700">
                  {sectionIndex + 1}. {section.title}
                </h3>
                <div className="divide-y divide-slate-100">
                  {section.lessons.map((lesson) => {
                    const row = (
                      <div className="flex items-center gap-4 py-4">
                        {completedIds.has(lesson.id) ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">
                            {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {lesson.youtubeUrl
                              ? "Бейнесабақ және теория"
                              : "Теория және тапсырма"}
                          </p>
                        </div>
                      </div>
                    );
                    return enrollment ? (
                      <Link
                        key={lesson.id}
                        href={`/courses/${slug}/lessons/${lesson.id}`}
                        className="block rounded-xl px-2 transition hover:bg-slate-50"
                      >
                        {row}
                      </Link>
                    ) : (
                      <div key={lesson.id}>{row}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {allLessons.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              Бұл курста жарияланған сабақ жоқ.
            </p>
          )}
          {finalAssessment?.isPublished && (
            <div className="mt-7 rounded-2xl border-2 border-black bg-[#f4ffd0] p-5 shadow-[4px_5px_0_#000]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-black bg-[#dfff3f]">
                    {finalUnlocked ? <GraduationCap className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-950">{finalAssessment.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {finalUnlocked
                        ? finalResult?.passed
                          ? `Нәтиже: ${finalResult.score}/10 · курс аяқталды`
                          : "10 балдық қорытынды жұмысты орындаңыз."
                        : "Барлық сабақ аяқталғаннан кейін ашылады."}
                    </p>
                  </div>
                </div>
                {finalUnlocked && (
                  <Link
                    href={`/courses/${slug}/final`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white px-5 text-sm font-black text-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]"
                  >
                    {finalResult?.answered ? "Нәтижені ашу" : "Бастау"}
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
        <aside className="h-fit rounded-[24px] border border-indigo-100 bg-indigo-50 p-6">
          <PlayCircle className="h-8 w-8 text-indigo-600" />
          <h2 className="mt-5 text-xl font-bold">
            {enrollment ? "Оқуды жалғастыру" : "Оқуды бастау"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {enrollment
              ? `Курс бойынша ілгерілеуіңіз: ${enrollment.progressPercent}%.`
              : "Курсқа қосылып, сабақтарды ретімен өтіңіз. Нәтиже профиліңізде сақталады."}
          </p>
          {enrollment && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${enrollment.progressPercent}%` }}
              />
            </div>
          )}
          <form action={startCourse.bind(null, course.id, slug)}>
            <ActionSubmitButton
              disabled={!allLessons.length}
              label={enrollment ? "Жалғастыру" : "Курсты бастау"}
              pendingLabel={enrollment ? "Сабақ ашылуда..." : "Курс ашылуда..."}
              successLabel="Ашылды"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border-2 border-black bg-[#dfff3f] text-sm font-black text-black shadow-[4px_5px_0_#000] hover:-translate-y-0.5 hover:bg-[#d4f52f] hover:shadow-[6px_7px_0_#000] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            />
          </form>
        </aside>
      </div>
    </main>
  );
}
