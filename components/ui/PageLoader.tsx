export default function PageLoader() {
  return (
    <main role="status" aria-live="polite" aria-label="Бет жүктелуде" className="min-h-[72vh] bg-[#f6f0dd] px-4 pb-20 pt-28 sm:px-6 md:pt-36">
      <div className="container"><div className="mx-auto w-full max-w-5xl animate-pulse">
        <div className="mb-10 space-y-4">
          <div className="h-4 w-28 rounded-full bg-indigo-100" />
          <div className="h-10 w-3/4 max-w-xl rounded-xl bg-slate-200 sm:h-12" />
          <div className="h-4 w-full max-w-2xl rounded-full bg-slate-100" />
          <div className="h-4 w-2/3 max-w-lg rounded-full bg-slate-100" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="aspect-[16/10] rounded-2xl bg-slate-100" />
              <div className="mt-5 h-5 w-4/5 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              <div className="mt-6 h-11 rounded-xl bg-indigo-50" />
            </div>
          ))}
        </div>
        <span className="sr-only">Жүктелуде...</span>
      </div></div>
    </main>
  );
}
