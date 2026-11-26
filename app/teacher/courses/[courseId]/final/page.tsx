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
  const scoreDifference = 10 - totalScore;
  const scoreReady = totalScore === 10;

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
        <div className={`min-w-56 rounded-xl border px-4 py-3 ${scoreReady ? "border-emerald-300 bg-emerald-50 text-emerald-900" : totalScore < 10 ? "border-amber-300 bg-amber-50 text-amber-900" : "border-rose-300 bg-rose-50 text-rose-900"}`} role="status">
          <div className="flex items-center justify-between gap-4 text-sm font-black">
            <span>Жалпы балл</span>
            <span className="tabular-nums">{totalScore}/10</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
            <div
              className={`h-full rounded-full ${scoreReady ? "bg-emerald-600" : totalScore < 10 ? "bg-amber-500" : "bg-rose-600"}`}
              style={{ width: `${Math.min(100, Math.max(0, totalScore * 10))}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold">
            {scoreReady
              ? "Дайын: 10/10 балл"
              : scoreDifference > 0
                ? `Тағы ${scoreDifference} балл қосу қажет`
                : `Жалпы балл ${Math.abs(scoreDifference)} баллға артық`}
          </p>
          {!scoreReady && (
            <p className="mt-1 text-xs font-medium opacity-80">
              Есепке тек сақталған тапсырмалар кіреді.
            </p>
          )}
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
          <span className="mt-2 block text-xs font-medium leading-5 text-slate-500">
            Барлық тапсырманың жалпы балы 10 болуы керек.
          </span>
        </label>
        <div className="space-y-4">
          <label className={`flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold ${scoreReady ? "bg-slate-50 text-slate-800" : "cursor-not-allowed bg-slate-100 text-slate-400"}`}>
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={assessment.isPublished}
              disabled={!scoreReady}
              className="h-4 w-4 accent-black"
            />
            Оқушыға жариялау
          </label>
          {!scoreReady && (
            <p className="text-xs font-semibold leading-5 text-amber-800">
              Жариялау үшін алдымен тапсырмаларды сақтап, жалпы балды 10/10
              етіңіз.
            </p>
          )}
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
