import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db/drizzle";
import { assignments } from "@/db/schema";
import { assertCourseAccess } from "../../actions";
import { findFinalAssessment } from "@/lib/final-assessment";
import { AssignmentBuilder } from "@/components/teacher/AssignmentBuilder";
import {
  createAssignment,
  deleteAssignment,
  moveAssignment,
  updateAssignment,
} from "../../assignment-actions";
import { updateFinalAssessment } from "../../final-actions";
import { ActionSubmitButton } from "@/components/ui/action-submit-button";

export default async function FinalAssessmentEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const { course } = await assertCourseAccess(courseId);
  const assessment = await findFinalAssessment(courseId);
  if (!assessment) redirect(`/teacher/courses/${courseId}`);
  const tasks = await db
    .select()
    .from(assignments)
    .where(eq(assignments.lessonId, assessment.id))
    .orderBy(asc(assignments.position));
  const totalScore = tasks.reduce((sum, task) => sum + task.maxScore, 0);

  return (
    <main className="container min-h-screen pb-24 pt-32">
      <Link
        href={`/teacher/courses/${courseId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Курс редакторына қайту
      </Link>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-[-.04em] text-slate-950">
            Қорытынды тапсырма
          </h1>
          <p className="mt-3 text-sm text-slate-600">{course.title}</p>
        </div>
        <div className={`rounded-xl border px-4 py-2 text-sm font-black ${totalScore === 10 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          Жалпы балл: {totalScore}/10
        </div>
      </div>
      <form
        action={updateFinalAssessment.bind(null, courseId)}
        className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:grid-cols-[1fr_180px_180px]"
      >
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-600">
            АТАУЫ
            <input
              name="title"
              required
              defaultValue={assessment.title}
              className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
            />
          </label>
          <label className="block text-xs font-bold text-slate-600">
            НҰСҚАУЛЫҚ
            <textarea
              name="summary"
              defaultValue={assessment.summary}
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6"
            />
          </label>
        </div>
        <label className="text-xs font-bold text-slate-600">
          ӨТУ БАЛЫ
          <input
            name="passScore"
            type="number"
            min="1"
            max="10"
            defaultValue={assessment.passScore}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
          />
        </label>
        <div className="space-y-4">
          <label className="flex min-h-11 items-center gap-3 rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-800">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={assessment.isPublished}
              className="h-4 w-4 accent-black"
            />
            Оқушыға жариялау
          </label>
          <ActionSubmitButton
            label="Баптауды сақтау"
            pendingLabel="Сақталуда..."
            successLabel="Сақталды"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"
          />
        </div>
      </form>
      <AssignmentBuilder
        lessonId={assessment.id}
        assignments={tasks}
        createAction={createAssignment}
        updateAction={updateAssignment}
        moveAction={moveAssignment}
        deleteAction={deleteAssignment}
      />
    </main>
  );
}
