import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { assignments, lessons } from "@/db/schema";
import { assertCourseAccess, updateLesson } from "../../../actions";
import { LessonBlockEditor } from "@/components/teacher/LessonBlockEditor";
import { sanitizeLessonBlocks } from "@/lib/lesson-content";
import { AssignmentBuilder } from "@/components/teacher/AssignmentBuilder";
import {
  createAssignment,
  deleteAssignment,
  moveAssignment,
  updateAssignment,
} from "../../../assignment-actions";

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  await assertCourseAccess(courseId);
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  if (!lesson) throw new Error("Сабақ табылмады");
  const tasks = await db
    .select()
    .from(assignments)
    .where(eq(assignments.lessonId, lessonId))
    .orderBy(asc(assignments.position));
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <Link
        href={`/teacher/courses/${courseId}`}
        className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Курс редакторына қайту
      </Link>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Сабақты өңдеу
        </p>
        <h1 className="mt-3 break-words text-3xl font-bold tracking-[-.04em] sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Материалдарды блоктармен құрастырып, оқушы көретін нәтижені бірден
          тексеріңіз.
        </p>
      </div>
      <LessonBlockEditor
        lesson={{
          title: lesson.title,
          summary: lesson.summary,
          content: sanitizeLessonBlocks(lesson.content),
          isPublished: lesson.isPublished,
        }}
        action={updateLesson.bind(null, lessonId)}
      />
      <AssignmentBuilder
        lessonId={lessonId}
        assignments={tasks}
        createAction={createAssignment}
        updateAction={updateAssignment}
        moveAction={moveAssignment}
        deleteAction={deleteAssignment}
      />
    </main>
  );
}
