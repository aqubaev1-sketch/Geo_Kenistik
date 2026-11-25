"use server";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { assignments, courseSections, lessons } from "@/db/schema";
import { assertCourseAccess } from "./actions";
import { findFinalAssessment } from "@/lib/final-assessment";

const defaultTasks = [
  { kind: "single", title: "Бір дұрыс жауап", maxScore: 1 },
  { kind: "multiple", title: "Бірнеше дұрыс жауап", maxScore: 2 },
  { kind: "number", title: "Сандық жауап", maxScore: 2 },
  { kind: "formula", title: "Формула", maxScore: 2 },
  { kind: "text", title: "Шешімді түсіндіру", maxScore: 3 },
] as const;

export async function createFinalAssessment(courseId: string) {
  await assertCourseAccess(courseId);
  const existing = await findFinalAssessment(courseId);
  if (existing) redirect(`/teacher/courses/${courseId}/final`);
  const [lastSection] = await db
    .select({ position: max(courseSections.position) })
    .from(courseSections)
    .where(eq(courseSections.courseId, courseId));
  const [section] = await db
    .insert(courseSections)
    .values({
      courseId,
      title: "Қорытынды бағалау",
      position: (lastSection?.position ?? -1) + 1,
    })
    .returning({ id: courseSections.id });
  const [assessment] = await db
    .insert(lessons)
    .values({
      sectionId: section.id,
      title: "Қорытынды тапсырма",
      slug: `final-${randomUUID().slice(0, 8)}`,
      summary: "Курс бойынша қорытынды біліміңізді тексеріңіз.",
      isFinalAssessment: true,
      isPublished: false,
      passScore: 6,
      position: 0,
    })
    .returning({ id: lessons.id });
  await db.insert(assignments).values(
    defaultTasks.map((task, position) => {
      const test = task.kind === "single" || task.kind === "multiple";
      const options = test
        ? [
            { id: randomUUID(), text: "1-нұсқа" },
            { id: randomUUID(), text: "2-нұсқа" },
          ]
        : [];
      return {
        lessonId: assessment.id,
        title: task.title,
        type: test ? ("test" as const) : task.kind,
        prompt: {
          text: "",
          imageUrl: "",
          imagePublicId: "",
          imageAssetId: "",
          formula: "",
        },
        settings: {
          kind: task.kind,
          options,
          correctAnswers: [],
          correctAnswer: "",
          sampleAnswer: "",
          explanation: "",
          tolerance: 0,
        },
        maxScore: task.maxScore,
        position,
      };
    }),
  );
  revalidatePath(`/teacher/courses/${courseId}`);
  redirect(`/teacher/courses/${courseId}/final`);
}

export async function updateFinalAssessment(
  courseId: string,
  formData: FormData,
) {
  await assertCourseAccess(courseId);
  const assessment = await findFinalAssessment(courseId);
  if (!assessment) throw new Error("Қорытынды тапсырма табылмады");
  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 1000);
  const passScore = Math.max(
    1,
    Math.min(10, Math.round(Number(formData.get("passScore")) || 6)),
  );
  const publish = formData.get("isPublished") === "on";
  if (!title) throw new Error("Қорытынды тапсырма атауын жазыңыз");
  if (publish) {
    const tasks = await db
      .select({
        title: assignments.title,
        prompt: assignments.prompt,
        settings: assignments.settings,
        maxScore: assignments.maxScore,
      })
      .from(assignments)
      .where(eq(assignments.lessonId, assessment.id))
      .orderBy(asc(assignments.position));
    const total = tasks.reduce((sum, task) => sum + task.maxScore, 0);
    if (total !== 10)
      throw new Error(`Жалпы балл дәл 10 болуы керек. Қазір: ${total}`);
    if (tasks.length < 1) throw new Error("Кемінде бір тапсырма қосыңыз");
    const incomplete = tasks.some((task) => {
      const prompt = task.prompt as Record<string, unknown>;
      const settings = task.settings as Record<string, unknown>;
      const kind = String(settings.kind || "");
      if (!task.title.trim() || !String(prompt.text || "").trim()) return true;
      if (kind === "single" || kind === "multiple")
        return !Array.isArray(settings.correctAnswers) || !settings.correctAnswers.length;
      if (kind === "number" || kind === "formula")
        return !String(settings.correctAnswer || "").trim();
      return false;
    });
    if (incomplete)
      throw new Error("Барлық тапсырманың шарты мен дұрыс жауабын толтырыңыз");
  }
  await db
    .update(lessons)
    .set({ title, summary, passScore, isPublished: publish })
    .where(eq(lessons.id, assessment.id));
  revalidatePath(`/teacher/courses/${courseId}/final`);
  revalidatePath(`/teacher/courses/${courseId}`);
}
