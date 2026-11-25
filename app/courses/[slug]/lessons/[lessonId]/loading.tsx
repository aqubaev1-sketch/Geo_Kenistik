export default function LessonLoading() {
  return (
    <main className="container min-h-screen pb-24 pt-28" aria-label="Сабақ жүктелуде">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="h-5 w-28 animate-pulse rounded-full bg-black/10" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-black/10" />
      </div>
      <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[560px] rounded-[28px] border border-black/10 bg-white p-6 sm:p-10">
          <div className="h-4 w-28 animate-pulse rounded-full bg-black/10" />
          <div className="mt-5 h-12 w-3/4 animate-pulse rounded-2xl bg-black/10" />
          <div className="mt-4 h-5 w-1/2 animate-pulse rounded-full bg-black/10" />
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-black/10" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-black/10" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-black/10" />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="h-36 animate-pulse rounded-[24px] border border-black/10 bg-[#dfff3f]/25" />
          <div className="h-72 animate-pulse rounded-[24px] border border-black/10 bg-white" />
        </aside>
      </div>
      <span className="sr-only">Сабақ жүктелуде...</span>
    </main>
  );
}
