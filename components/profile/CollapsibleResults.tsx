"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleResultsProps = {
  recent: ReactNode;
  older: ReactNode;
  olderCount: number;
};

export function CollapsibleResults({
  recent,
  older,
  olderCount,
}: CollapsibleResultsProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
      return;
    }

    setExpanded(true);
  };

  return (
    <div ref={containerRef} className="mt-4 space-y-3">
      {recent}
      {expanded && older}
      {olderCount > 0 && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {expanded
            ? "Қосымша нәтижелерді жасыру"
            : `Барлық нәтижелерді көрсету (${olderCount})`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
