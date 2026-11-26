import Link from "next/link";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Search,
  Target,
  Users,
} from "lucide-react";
import { db } from "@/db/drizzle";
import {
  assignments,
  courseSections,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  submissions,
  user,
} from "@/db/schema";
import { requireRole } from "@/lib/authorization";

export default async function TeacherStatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; student?: string }>;
}) {
  const { session, role } = await requireRole(["teacher", "admin"]);
  const filters = await searchParams;
  const teacherFilter =
    role === "admin" ? undefined : eq(courses.teacherId, session.user.id);
  const selectedCourse = filters.course || "";
  const courseCondition = selectedCourse
    ? and(teacherFilter, eq(courses.id, selectedCourse))
    : teacherFilter;
  const courseRowsQuery = db
    .select({ id: courses.id, title: courses.title, status: courses.status })
    .from(courses)
    .where(teacherFilter)
    .orderBy(asc(courses.title));
  const enrollmentRowsQuery = db
    .select({
      id: enrollments.id,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      courseId: courses.id,
      courseTitle: courses.title,
      progressPercent: enrollments.progressPercent,
      lastActiveAt: enrollments.lastActiveAt,
      completedAt: enrollments.completedAt,
    })
    .from(enrollments)
    .innerJoin(user, eq(enrollments.studentId, user.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(courseCondition)
    .orderBy(desc(enrollments.lastActiveAt));
  const lessonRowsQuery = db
    .select({ id: lessons.id, courseId: courses.id })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(
      and(
        courseCondition,
        eq(lessons.isPublished, true),
        eq(lessons.isFinalAssessment, false),
      ),
    );
  const progressRowsQuery = db
    .select({
      studentId: lessonProgress.studentId,
      lessonId: lessons.id,
      courseId: courses.id,
      status: lessonProgress.status,
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(courseCondition);
  const taskRowsQuery = db
    .select({
      id: assignments.id,
      title: assignments.title,
      courseId: courses.id,
      courseTitle: courses.title,
      lessonTitle: lessons.title,
      maxScore: assignments.maxScore,
      isFinalAssessment: lessons.isFinalAssessment,
      passScore: lessons.passScore,
    })
    .from(assignments)
    .innerJoin(lessons, eq(assignments.lessonId, lessons.id))
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(courseCondition);
  const submissionRowsQuery = db
    .select({
      studentId: submissions.studentId,
      assignmentId: submissions.assignmentId,
      status: submissions.status,
      score: submissions.score,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .innerJoin(lessons, eq(assignments.lessonId, lessons.id))
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(courseCondition)
    .orderBy(desc(submissions.submittedAt));
  const [
    courseRows,
    enrollmentRows,
    lessonRows,
    progressRows,
    taskRows,
    submissionRows,
  ] = await Promise.all([
    courseRowsQuery,
    enrollmentRowsQuery,
    lessonRowsQuery,
    progressRowsQuery,
    taskRowsQuery,
    submissionRowsQuery,
  ]);
  const latestAttempts = new Map<string, (typeof submissionRows)[number]>();
  for (const item of submissionRows) {
    const key = `${item.studentId}:${item.assignmentId}`;
    if (!latestAttempts.has(key)) latestAttempts.set(key, item);
  }
  const search = (filters.student || "").trim().toLowerCase();
  const studentRows = enrollmentRows
    .filter(
      (item) =>
        !search ||
        item.studentName.toLowerCase().includes(search) ||
        item.studentEmail.toLowerCase().includes(search),
    )
    .map((item) => {
      const courseTasks = taskRows.filter(
        (task) => task.courseId === item.courseId && !task.isFinalAssessment,
      );
      const finalTasks = taskRows.filter(
        (task) => task.courseId === item.courseId && task.isFinalAssessment,
      );
      const attempts = courseTasks.map((task) => ({
        task,
        attempt: latestAttempts.get(`${item.studentId}:${task.id}`),
      }));
      const finalAttempts = finalTasks.map((task) => ({
        task,
        attempt: latestAttempts.get(`${item.studentId}:${task.id}`),
      }));
      const completedLessons = progressRows.filter(
        (progress) =>
          progress.courseId === item.courseId &&
          progress.studentId === item.studentId &&
          progress.status === "completed",
      ).length;
      const lessonCount = lessonRows.filter(
        (lesson) => lesson.courseId === item.courseId,
      ).length;
      const score = attempts.reduce(
        (sum, row) =>
          sum +
          (row.attempt?.status === "checked" ? (row.attempt.score ?? 0) : 0),
        0,
      );
      const maxScore = courseTasks.reduce((sum, row) => sum + row.maxScore, 0);
      const correct = attempts.filter(
        (row) =>
          row.attempt?.status === "checked" &&
          row.attempt.score === row.task.maxScore,
      ).length;
      const wrong = attempts.filter(
        (row) =>
          row.attempt?.status === "checked" &&
          row.attempt.score !== row.task.maxScore,
      ).length;
      const finalScore = finalAttempts.reduce(
        (sum, row) =>
          sum +
          (row.attempt?.status === "checked" ? (row.attempt.score ?? 0) : 0),
        0,
      );
      const finalPending = finalAttempts.some(
        (row) => row.attempt?.status === "submitted",
      );
      const finalAnswered = finalAttempts.filter((row) => row.attempt).length;
      const finalPassed =
        finalTasks.length > 0 &&
        finalAnswered === finalTasks.length &&
        !finalPending &&
        finalScore >= (finalTasks[0]?.passScore ?? 6);
      return {
        ...item,
        completedLessons,
        lessonCount,
        score,
        maxScore,
        correct,
        wrong,
        finalScore,
        finalPending,
        finalAnswered,
        finalPassed,
        hasFinal: finalTasks.length > 0,
      };
    });
  const visibleStudentsByCourse = new Map<string, Set<string>>();
  for (const student of studentRows) {
    const students = visibleStudentsByCourse.get(student.courseId) ?? new Set();
    students.add(student.studentId);
    visibleStudentsByCourse.set(student.courseId, students);
  }
  const assignmentStats = taskRows
    .filter((task) => !task.isFinalAssessment)
    .map((task) => {
      const studentIds =
        visibleStudentsByCourse.get(task.courseId) ?? new Set();
      const attempts = Array.from(studentIds)
        .map((studentId) => latestAttempts.get(`${studentId}:${task.id}`))
        .filter((attempt) => Boolean(attempt));
      const checked = attempts.filter(
        (attempt) => attempt?.status === "checked",
      );
      const averagePercent = checked.length
        ? Math.round(
            checked.reduce(
              (sum, attempt) =>
                sum + ((attempt?.score ?? 0) / task.maxScore) * 100,
              0,
            ) / checked.length,
          )
        : 0;
      return {
        ...task,
        studentCount: studentIds.size,
        answered: attempts.length,
        checked: checked.length,
        correct: checked.filter((attempt) => attempt?.score === task.maxScore)
          .length,
        pending: attempts.filter((attempt) => attempt?.status === "submitted")
          .length,
        averagePercent,
      };
    });
  const averageProgress = enrollmentRows.length
    ? Math.round(
        enrollmentRows.reduce((sum, item) => sum + item.progressPercent, 0) /
          enrollmentRows.length,
      )
    : 0;
  const completedCount = enrollmentRows.filter(
    (item) => item.completedAt,
  ).length;
  const stats = [
    [Users, String(enrollmentRows.length), "Оқушы"],
    [BarChart3, `${averageProgress}%`, "Орташа прогресс"],
    [CheckCircle2, String(completedCount), "Курсты аяқтады"],
    [Target, String(taskRows.length), "Тапсырма"],
  ] as const;
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <Link
        href="/teacher"
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Дашбордқа қайту
      </Link>
      <div className="mb-8">
        <p className="text-xs font-bold text-indigo-600">НӘТИЖЕЛЕР</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-slate-900 sm:text-4xl">
          Оқу статистикасы
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Курстар бойынша прогресс пен тапсырма нәтижелерін бақылаңыз.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(([Icon, value, label]) => (
          <article
            key={label}
            className="rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5"
          >
            <Icon className="h-5 w-5 text-indigo-600" />
            <b className="mt-5 block text-3xl text-slate-900">{value}</b>
            <span className="text-sm text-slate-500">{label}</span>
          </article>
        ))}
      </div>
      <form className="mt-6 grid gap-3 rounded-[22px] border border-slate-200 bg-white p-4 md:grid-cols-[260px_1fr_auto]">
        <select
          name="course"
          defaultValue={selectedCourse}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Барлық курс</option>
          {courseRows.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <label className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            name="student"
            defaultValue={filters.student || ""}
            placeholder="Оқушыны іздеу"
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm"
          />
        </label>
        <button className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white">
          Қолдану
        </button>
      </form>
      <section className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <h2 className="text-xl font-bold">Оқушылар нәтижесі</h2>
        </div>
        {studentRows.length ? (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {studentRows.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <b className="block truncate text-slate-950">
                        {item.studentName}
                      </b>
                      <p className="mt-1 break-all text-xs text-slate-600">
                        {item.studentEmail}
                      </p>
                    </div>
                    <b className="shrink-0 text-sm tabular-nums text-slate-950">
                      {item.progressPercent}%
                    </b>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {item.courseTitle}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Сабақ</dt>
                      <dd className="mt-1 font-bold tabular-nums text-slate-950">
                        {item.completedLessons}/{item.lessonCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Нәтиже</dt>
                      <dd className="mt-1 font-bold tabular-nums text-slate-950">
                        {item.score}/{item.maxScore}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Қорытынды</dt>
                      <dd
                        className={`mt-1 font-bold tabular-nums ${item.finalPending ? "text-amber-800" : item.finalPassed ? "text-emerald-800" : "text-slate-950"}`}
                      >
                        {item.hasFinal ? `${item.finalScore}/10` : "—"}
                        {item.finalPending ? " · тексеруде" : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Жауаптар</dt>
                      <dd className="mt-1 text-xs font-bold">
                        <span className="text-emerald-700">
                          {item.correct} дұрыс
                        </span>
                        <span className="ml-2 text-rose-700">
                          {item.wrong} қате
                        </span>
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 flex items-center gap-1.5 border-t border-slate-200 pt-3 text-xs text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {item.lastActiveAt.toLocaleString("kk-KZ")}
                  </p>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Оқушы</th>
                    <th className="px-4 py-4">Курс</th>
                    <th className="px-4 py-4">Прогресс</th>
                    <th className="px-4 py-4">Сабақ</th>
                    <th className="px-4 py-4">Нәтиже</th>
                    <th className="px-4 py-4">Қорытынды</th>
                    <th className="px-4 py-4">Жауаптар</th>
                    <th className="px-6 py-4">Соңғы белсенділік</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentRows.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-5">
                        <b className="block text-slate-900">
                          {item.studentName}
                        </b>
                        <span className="text-xs text-slate-400">
                          {item.studentEmail}
                        </span>
                      </td>
                      <td className="px-4 py-5 font-semibold text-slate-700">
                        {item.courseTitle}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                          <b className="text-xs text-indigo-600">
                            {item.progressPercent}%
                          </b>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        {item.completedLessons}/{item.lessonCount}
                      </td>
                      <td className="px-4 py-5">
                        <b>
                          {item.score}/{item.maxScore}
                        </b>
                      </td>
                      <td className="px-4 py-5">
                        <b
                          className={
                            item.finalPending
                              ? "text-amber-700"
                              : item.finalPassed
                                ? "text-emerald-700"
                                : "text-slate-700"
                          }
                        >
                          {item.hasFinal ? `${item.finalScore}/10` : "—"}
                        </b>
                        {item.finalPending && (
                          <span className="mt-1 block text-[10px] text-amber-700">
                            тексеруде
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-emerald-600">
                          {item.correct} дұрыс
                        </span>
                        <span className="ml-2 text-rose-600">
                          {item.wrong} қате
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {item.lastActiveAt.toLocaleString("kk-KZ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500 sm:p-12">
            Таңдалған сүзгі бойынша оқушы табылмады.
          </div>
        )}
      </section>
      <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6">
        <div>
          <p className="text-xs font-bold text-indigo-600">ТАПСЫРМАЛАР</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            Тапсырмалар аналитикасы
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Әр тапсырма бойынша жауап беру белсенділігі мен орташа нәтижені
            салыстырыңыз.
          </p>
        </div>
        {assignmentStats.length ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {assignmentStats.map((task) => (
              <article
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-bold text-indigo-600">
                  {task.courseTitle} · {task.lessonTitle}
                </p>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h3 className="min-w-0 break-words font-bold text-slate-950">
                    {task.title}
                  </h3>
                  <b className="shrink-0 tabular-nums text-slate-950">
                    {task.averagePercent}%
                  </b>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${task.averagePercent}%` }}
                  />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-slate-500">Жауап берді</dt>
                    <dd className="mt-1 font-bold tabular-nums text-slate-950">
                      {task.answered}/{task.studentCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Тексерілді</dt>
                    <dd className="mt-1 font-bold tabular-nums text-slate-950">
                      {task.checked}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Толық дұрыс</dt>
                    <dd className="mt-1 font-bold tabular-nums text-emerald-700">
                      {task.correct}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Тексеруде</dt>
                    <dd className="mt-1 font-bold tabular-nums text-amber-700">
                      {task.pending}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            Таңдалған курс бойынша тапсырма жоқ.
          </div>
        )}
      </section>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <BookOpen className="h-4 w-4" />
        Баллдар әр тапсырманың соңғы әрекеті бойынша есептеледі.
      </div>
    </main>
  );
}
