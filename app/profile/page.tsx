import Link from "next/link";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  Pencil,
  Play,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { PageIntro } from "@/components/platform/PageIntro";
import { db } from "@/db/drizzle";
import {
  assignments,
  courseSections,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  mediaAssets,
  submissions,
} from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { CourseCover } from "@/components/courses/CourseCover";
import { CollapsibleResults } from "@/components/profile/CollapsibleResults";

export default async function ProfilePage() {
  const { session, role } = await requireRole(["student", "teacher", "admin"]);
  const isStudent = role === "student";
  if (!isStudent) {
    const courseRows = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        status: courses.status,
        coverUrl: mediaAssets.publicUrl,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .leftJoin(mediaAssets, eq(courses.coverMediaId, mediaAssets.id))
      .where(eq(courses.teacherId, session.user.id))
      .orderBy(desc(courses.updatedAt));
    const courseIds = courseRows.map((item) => item.id);
    const enrollmentRows = courseIds.length
      ? await db
          .select({
            courseId: enrollments.courseId,
            studentId: enrollments.studentId,
            progress: enrollments.progressPercent,
          })
          .from(enrollments)
          .where(inArray(enrollments.courseId, courseIds))
      : [];
    const pendingRows = courseIds.length
      ? await db
          .select({ id: submissions.id, courseId: courses.id })
          .from(submissions)
          .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
          .innerJoin(lessons, eq(assignments.lessonId, lessons.id))
          .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
          .innerJoin(courses, eq(courseSections.courseId, courses.id))
          .where(
            and(
              inArray(courses.id, courseIds),
              eq(submissions.status, "submitted"),
            ),
          )
      : [];
    const metrics = new Map(
      courseRows.map((course) => {
        const enrolled = enrollmentRows.filter(
          (item) => item.courseId === course.id,
        );
        return [
          course.id,
          {
            students: new Set(enrolled.map((item) => item.studentId)).size,
            average: enrolled.length
              ? Math.round(
                  enrolled.reduce((sum, item) => sum + item.progress, 0) /
                    enrolled.length,
                )
              : 0,
            pending: pendingRows.filter((item) => item.courseId === course.id)
              .length,
          },
        ];
      }),
    );
    const uniqueStudents = new Set(enrollmentRows.map((item) => item.studentId))
      .size;
    const overallProgress = enrollmentRows.length
      ? Math.round(
          enrollmentRows.reduce((sum, item) => sum + item.progress, 0) /
            enrollmentRows.length,
        )
      : 0;
    const stats = [
      [
        BookOpen,
        String(courseRows.filter((item) => item.status === "published").length),
        "Жарияланған курс",
      ],
      [Users, String(uniqueStudents), "Оқушы"],
      [BarChart3, `${overallProgress}%`, "Орташа прогресс"],
      [Clock3, String(pendingRows.length), "Тексеруді күтеді"],
    ] as const;
    const statusLabel = {
      draft: "Жоба",
      published: "Жарияланған",
      archived: "Мұрағат",
    } as const;
    return (
      <main className="container min-h-screen pb-24 pt-32">
        <PageIntro
          eyebrow="Мұғалім профилі"
          title={session.user.name}
          description="Курстарыңыз, оқушылар белсенділігі және тексерілетін жұмыстар бір жерде."
          action={
            <Link
              href="/teacher"
              className="inline-flex min-h-12 items-center rounded-[14px] border-2 border-black bg-[#dfff3f] px-5 py-2 text-sm font-black text-black shadow-[3px_4px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#d4f52f] hover:shadow-[5px_6px_0_#000] active:translate-y-0 active:scale-[.98] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]/50"
            >
              Дашбордты ашу
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([Icon, value, label]) => (
            <article
              key={label}
              className="rounded-[22px] border border-slate-200 bg-white p-6"
            >
              <Icon className="h-5 w-5 text-indigo-600" />
              <b className="mt-6 block text-3xl tabular-nums text-slate-900">
                {value}
              </b>
              <span className="mt-1 block text-sm text-slate-600">{label}</span>
            </article>
          ))}
        </div>
        <section className="mt-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-[-.025em] text-slate-900">
                Менің курстарым
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Курс күйін, оқушылар ілгерілеуін және тексеру кезегін бақылаңыз.
              </p>
            </div>
            <Link
              href="/teacher/courses"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700"
            >
              Барлық курсты басқару
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {courseRows.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {courseRows.map((course) => {
                const item = metrics.get(course.id)!;
                return (
                  <article
                    key={course.id}
                    className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"
                  >
                    <CourseCover
                      url={course.coverUrl}
                      className="aspect-[16/6]"
                    />
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${course.status === "published" ? "bg-emerald-50 text-emerald-700" : course.status === "archived" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}
                          >
                            {statusLabel[course.status]}
                          </span>
                          <h3 className="mt-3 break-words text-xl font-bold text-slate-900">
                            {course.title}
                          </h3>
                        </div>
                        {item.pending > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            {item.pending} жұмыс
                          </span>
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
                        {course.description || "Курс сипаттамасы қосылмаған."}
                      </p>
                      <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 px-2 py-4 text-center">
                        <div className="px-2">
                          <dt className="text-xs leading-5 text-slate-500">
                            Оқушы
                          </dt>
                          <dd className="mt-1 font-bold tabular-nums text-slate-900">
                            {item.students}
                          </dd>
                        </div>
                        <div className="px-2">
                          <dt className="text-xs leading-5 text-slate-500">
                            Прогресс
                          </dt>
                          <dd className="mt-1 font-bold tabular-nums text-slate-900">
                            {item.average}%
                          </dd>
                        </div>
                        <div className="px-2">
                          <dt className="text-xs leading-5 text-slate-500">
                            Тексеру
                          </dt>
                          <dd className="mt-1 font-bold tabular-nums text-slate-900">
                            {item.pending}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/teacher/courses/${course.id}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-black bg-[#dfff3f] px-4 py-2 text-sm font-black text-black shadow-[3px_4px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#d4f52f] hover:shadow-[5px_6px_0_#000] active:translate-y-0 active:scale-[.98] active:shadow-none"
                        >
                          <Pencil className="h-4 w-4" />
                          Редакторды ашу
                        </Link>
                        {course.status === "published" && (
                          <Link
                            href={`/courses/${course.slug}`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-[#fffef8] hover:shadow-[3px_4px_0_#000] active:translate-y-0 active:scale-[.98] active:shadow-none"
                          >
                            <Eye className="h-4 w-4" />
                            Курсты көру
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-indigo-500" />
              <h3 className="mt-4 font-bold text-slate-900">
                Курс әлі құрылмаған
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Алғашқы курсты құрып, материалдарды толтыруды бастаңыз.
              </p>
              <Link
                href="/teacher/courses"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl border-2 border-black bg-[#dfff3f] px-4 py-2 text-sm font-black text-black shadow-[3px_4px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#d4f52f] active:translate-y-0 active:scale-[.98] active:shadow-none"
              >
                Курс құру
              </Link>
            </div>
          )}
        </section>
      </main>
    );
  }
  const rows = await db
    .select({
      id: enrollments.id,
      courseId: courses.id,
      title: courses.title,
      slug: courses.slug,
      coverUrl: mediaAssets.publicUrl,
      progress: enrollments.progressPercent,
      lastActiveAt: enrollments.lastActiveAt,
      completedAt: enrollments.completedAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(mediaAssets, eq(courses.coverMediaId, mediaAssets.id))
    .where(eq(enrollments.studentId, session.user.id))
    .orderBy(desc(enrollments.lastActiveAt));
  const [completedLessons] = await db
    .select({ value: count() })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.studentId, session.user.id),
        eq(lessonProgress.status, "completed"),
      ),
    );
  const courseIds = rows.map((item) => item.courseId);
  const taskRows = courseIds.length
    ? await db
        .select({
          id: assignments.id,
          maxScore: assignments.maxScore,
          lessonId: lessons.id,
          lessonTitle: lessons.title,
          isFinalAssessment: lessons.isFinalAssessment,
          passScore: lessons.passScore,
          courseId: courses.id,
          courseTitle: courses.title,
          courseSlug: courses.slug,
        })
        .from(assignments)
        .innerJoin(lessons, eq(assignments.lessonId, lessons.id))
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(inArray(courses.id, courseIds))
    : [];
  const attempts = taskRows.length
    ? await db
        .select({
          assignmentId: submissions.assignmentId,
          status: submissions.status,
          score: submissions.score,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .where(
          and(
            eq(submissions.studentId, session.user.id),
            inArray(
              submissions.assignmentId,
              taskRows.map((item) => item.id),
            ),
          ),
        )
        .orderBy(desc(submissions.submittedAt))
    : [];
  const latestAttempts = new Map<string, (typeof attempts)[number]>();
  for (const item of attempts)
    if (!latestAttempts.has(item.assignmentId))
      latestAttempts.set(item.assignmentId, item);
  const lessonIds = Array.from(
    new Set(
      taskRows
        .filter((item) => !item.isFinalAssessment)
        .map((item) => item.lessonId),
    ),
  );
  const lessonResults = lessonIds.map((lessonId) => {
    const tasks = taskRows.filter((item) => item.lessonId === lessonId);
    const latest = tasks.map((item) => ({
      task: item,
      attempt: latestAttempts.get(item.id),
    }));
    return {
      lessonId,
      lessonTitle: tasks[0].lessonTitle,
      courseTitle: tasks[0].courseTitle,
      courseSlug: tasks[0].courseSlug,
      maxScore: tasks.reduce((sum, item) => sum + item.maxScore, 0),
      score: latest.reduce(
        (sum, item) =>
          sum +
          (item.attempt?.status === "checked" ? (item.attempt.score ?? 0) : 0),
        0,
      ),
      correct: latest.filter(
        (item) =>
          item.attempt?.status === "checked" &&
          item.attempt.score === item.task.maxScore,
      ).length,
      wrong: latest.filter(
        (item) =>
          item.attempt?.status === "checked" &&
          item.attempt.score !== item.task.maxScore,
      ).length,
      pending: latest.filter((item) => item.attempt?.status === "submitted")
        .length,
      revision: latest.filter((item) => item.attempt?.status === "revision")
        .length,
      total: tasks.length,
      latestAt: latest.reduce(
        (latestDate, item) =>
          item.attempt?.submittedAt && item.attempt.submittedAt > latestDate
            ? item.attempt.submittedAt
            : latestDate,
        new Date(0),
      ),
    };
  });
  const sortedLessonResults = [...lessonResults].sort(
    (a, b) => b.latestAt.getTime() - a.latestAt.getTime(),
  );
  const recentLessonResults = sortedLessonResults.slice(0, 3);
  const olderLessonResults = sortedLessonResults.slice(3);
  const finalResults = Array.from(
    new Set(
      taskRows
        .filter((item) => item.isFinalAssessment)
        .map((item) => item.courseId),
    ),
  ).map((courseId) => {
    const tasks = taskRows.filter(
      (item) => item.courseId === courseId && item.isFinalAssessment,
    );
    const current = tasks.map((task) => ({
      task,
      attempt: latestAttempts.get(task.id),
    }));
    const score = current.reduce(
      (sum, item) =>
        sum +
        (item.attempt?.status === "checked" ? (item.attempt.score ?? 0) : 0),
      0,
    );
    const pending = current.filter(
      (item) => item.attempt?.status === "submitted",
    ).length;
    const answered = current.filter((item) => item.attempt).length;
    const maxScore = tasks.reduce((sum, task) => sum + task.maxScore, 0);
    return {
      courseId,
      courseTitle: tasks[0].courseTitle,
      courseSlug: tasks[0].courseSlug,
      score,
      maxScore,
      pending,
      answered,
      passed:
        answered === tasks.length &&
        pending === 0 &&
        score >= tasks[0].passScore,
    };
  }).filter((result) => result.answered > 0);
  const completedCourses = rows.filter((item) => item.completedAt).length;
  const totalScore = lessonResults.reduce((sum, item) => sum + item.score, 0);
  const totalMax = lessonResults.reduce((sum, item) => sum + item.maxScore, 0);
  const stats = [
    [BookOpen, String(rows.length), "Басталған курс"],
    [CheckCircle2, String(completedLessons.value), "Аяқталған сабақ"],
    [Target, `${totalScore}/${totalMax}`, "Жалпы балл"],
  ] as const;
  const renderLessonResult = (result: (typeof lessonResults)[number]) => {
    const progress = result.maxScore
      ? Math.round((result.score / result.maxScore) * 100)
      : 0;

    return (
      <article
        key={result.lessonId}
        className="group min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300"
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-500">
              {result.courseTitle}
            </p>
            <p className="mt-1 truncate font-bold text-slate-900">
              {result.lessonTitle}
            </p>
          </div>
          <b className="shrink-0 text-lg tabular-nums text-slate-900">
            {progress}%
          </b>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label={`${result.lessonTitle} сабағының нәтижесі`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-[#b9e900] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Дұрыс: {result.correct}
          </span>
          <span className="inline-flex items-center gap-1 text-rose-700">
            <XCircle className="h-4 w-4" />
            Қате: {result.wrong}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700">
            <Clock3 className="h-4 w-4" />
            Тексеруде: {result.pending}
          </span>
          {result.revision > 0 && (
            <span className="text-rose-700">
              Қайта тапсыру: {result.revision}
            </span>
          )}
          <Link
            href={`/courses/${result.courseSlug}/lessons/${result.lessonId}`}
            className="ml-auto inline-flex min-h-10 items-center gap-2 font-bold text-slate-900 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Сабақты ашу
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </article>
    );
  };
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <PageIntro
        eyebrow="Оқушы профилі"
        title={session.user.name}
        description="Оқу ілгерілеуіңіз бен тапсырма нәтижелеріңіз осы жерде жиналады."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(([Icon, value, label]) => (
          <article
            key={label}
            className="rounded-[22px] border border-slate-200 bg-white p-6"
          >
            <Icon className="h-5 w-5 text-indigo-600" />
            <b className="mt-6 block text-3xl text-slate-900">{value}</b>
            <span className="text-sm text-slate-500">{label}</span>
          </article>
        ))}
      </div>
      <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">Менің курстарым</h2>
        {rows.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {rows.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
              >
                <CourseCover url={item.coverUrl} className="aspect-[16/6]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.completedAt ? "Курс аяқталды" : "Оқу жалғасуда"}
                      </p>
                    </div>
                    <b className="text-sm text-indigo-600">{item.progress}%</b>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <Link
                    href={`/courses/${item.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600"
                  >
                    <Play className="h-4 w-4" />
                    Курсты ашу
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-10 text-center text-sm text-slate-500">
            Курсты бастағаннан кейін прогресс осы жерде көрінеді.
          </div>
        )}
      </section>
      <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-indigo-600">НӘТИЖЕЛЕР</p>
            <h2 className="mt-2 text-xl font-bold">Соңғы сабақ нәтижелері</h2>
          </div>
          <span className="text-xs text-slate-400">
            Аяқталған курс: {completedCourses}
          </span>
        </div>
        {recentLessonResults.length ? (
          <CollapsibleResults
            recent={recentLessonResults.map(renderLessonResult)}
            older={olderLessonResults.map(renderLessonResult)}
            olderCount={olderLessonResults.length}
          />
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            Тапсырмаларды орындағаннан кейін нәтижелер осы жерде көрінеді.
          </div>
        )}
      </section>
      {finalResults.length > 0 && (
        <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Қорытынды бағалау
          </h2>
          <div className="mt-4 space-y-3">
            {finalResults.map((result) => (
              <Link
                key={result.courseId}
                href={`/courses/${result.courseSlug}/final`}
                className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-950">
                    {result.courseTitle}
                  </p>
                  <p className={`mt-1 text-xs font-bold ${result.pending ? "text-amber-700" : result.passed ? "text-emerald-700" : "text-slate-600"}`}>
                    {result.pending
                      ? "Мұғалімнің тексеруін күтеді"
                      : result.passed
                        ? "Курс сәтті аяқталды"
                        : result.answered
                          ? "Қайта орындауға болады"
                          : "Әлі орындалмаған"}
                  </p>
                </div>
                <b className="shrink-0 text-xl tabular-nums text-slate-950">
                  {result.score}/{result.maxScore || 10}
                </b>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
