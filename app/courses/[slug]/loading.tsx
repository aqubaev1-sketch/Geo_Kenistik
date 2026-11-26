import { MorphingSquare } from "@/components/ui/morphing-square";

export default function CourseLoading() {
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <div className="relative min-h-64 overflow-hidden rounded-[28px] border border-black/10 bg-white p-8 sm:p-12">
        <div className="absolute inset-0 grid place-items-center bg-[#f6f0dd]/85">
          <MorphingSquare message="Курс жүктелуде..." />
        </div>
      </div>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[24px] border border-black/10 bg-white p-6">
          <div className="h-7 w-44 animate-pulse rounded-lg bg-black/10" />
          <div className="mt-6 space-y-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 py-3">
                <div className="h-5 w-5 animate-pulse rounded-full bg-black/10" />
                <div className="h-5 flex-1 animate-pulse rounded-lg bg-black/10" />
              </div>
            ))}
          </div>
        </section>
        <aside className="h-60 animate-pulse rounded-[24px] border border-black/10 bg-[#dfff3f]/25" />
      </div>
    </main>
  );
}
