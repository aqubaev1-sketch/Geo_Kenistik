import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { requireRole } from "@/lib/authorization";
import { PageIntro } from "@/components/platform/PageIntro";
import { db } from "@/db/drizzle";
import { courses, mediaAssets } from "@/db/schema";
import { createCourse } from "./actions";
import { CourseCover } from "@/components/courses/CourseCover";
import { ActionSubmitButton } from "@/components/ui/action-submit-button";

const labels = {
  draft: "Жоба",
  published: "Жарияланған",
  archived: "Мұрағат",
} as const;
export default async function TeacherCoursesPage() {
  const { session } = await requireRole(["teacher", "admin"]);
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      status: courses.status,
      coverUrl: mediaAssets.publicUrl,
    })
    .from(courses)
    .leftJoin(mediaAssets, eq(courses.coverMediaId, mediaAssets.id))
    .where(eq(courses.teacherId, session.user.id))
    .orderBy(desc(courses.updatedAt));
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <PageIntro
        eyebrow="Контентті басқару"
        title="Менің курстарым"
        description="Курс, бөлім және сабақтарды бір жерден құрыңыз және жариялаңыз."
      />
      <section className="mb-8 rounded-[24px] border border-indigo-100 bg-indigo-50/60 p-4 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm">
              <Plus className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-2xl font-bold">Жаңа курс</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Курс әрқашан жоба ретінде құрылады. Дайын болғанда редактордан
              жариялайсыз.
            </p>
          </div>
          <form action={createCourse} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Курс атауы
              <input
                name="title"
                required
                minLength={3}
                placeholder="Мысалы: 10-сынып геометриясы"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-400"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Қысқаша сипаттама
              <textarea
                name="description"
                placeholder="Курс туралы қысқаша ақпарат"
                className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-indigo-400"
              />
            </label>
            <ActionSubmitButton
              label="Курс құру"
              pendingLabel="Курс құрылуда..."
              successLabel="Курс құрылды"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#dfff3f] px-5 text-sm font-black text-black shadow-[3px_4px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#d4f52f] hover:shadow-[5px_6px_0_#000] active:translate-y-0 active:scale-[.98] active:shadow-none sm:w-auto"
            />
          </form>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.length === 0 ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 sm:p-12">
            Әзірге курс жоқ. Жоғарыдағы нысан арқылы алғашқы курсты құрыңыз.
          </div>
        ) : (
          rows.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"
            >
              <CourseCover url={course.coverUrl} className="aspect-[16/7]" />
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${course.status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                  >
                    {labels[course.status]}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold">{course.title}</h2>
                <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
                  {course.description || "Сипаттама қосылмаған"}
                </p>
                <Link
                  href={`/teacher/courses/${course.id}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-indigo-600"
                >
                  Редакторды ашу <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
