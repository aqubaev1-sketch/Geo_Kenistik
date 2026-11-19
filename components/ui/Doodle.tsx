import type { ReactNode, SVGProps } from "react";

type DoodleVariant = "wave" | "loop" | "spark" | "rays" | "arrow" | "triangle";

type DoodleProps = SVGProps<SVGSVGElement> & { variant: DoodleVariant };

export function Doodle({ variant, ...props }: DoodleProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  const paths: Record<DoodleVariant, ReactNode> = {
    wave: <path {...common} d="M5 58C19 7 36 6 48 55S75 102 88 48s31-50 42 2 28 60 43 1 30-57 42-8" />,
    loop: <path {...common} d="M8 65c42 5 70-58 40-60C18 3 16 56 46 76c29 20 70 3 65-28-4-27-41-20-48 12-7 31 16 55 47 60" />,
    spark: <path {...common} d="M48 4c2 27 12 38 38 42-26 3-37 14-40 41-4-27-14-38-42-41 28-4 39-14 44-42Z" />,
    rays: <><path {...common} d="M9 25 41 9M18 52l35-3M39 81l21-28" /></>,
    arrow: <><path {...common} d="M5 42c31-1 57 0 91 0" /><path {...common} d="m72 19 25 23-25 22" /></>,
    triangle: <><path {...common} d="m51 7 43 77H8L51 7Z" /><path {...common} d="M28 44h47" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 110 100" {...props}>{paths[variant]}</svg>;
}
