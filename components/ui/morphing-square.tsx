"use client";

import { cva } from "class-variance-authority";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const morphingSquareVariants = cva(
  "flex items-center justify-center gap-3 text-sm font-bold text-slate-800",
  {
    variants: {
      messagePlacement: {
        bottom: "flex-col",
        top: "flex-col-reverse",
        right: "flex-row",
        left: "flex-row-reverse",
      },
    },
    defaultVariants: {
      messagePlacement: "bottom",
    },
  },
);

export interface MorphingSquareProps {
  message?: string;
  /** Position of the message relative to the spinner. @default bottom */
  messagePlacement?: "top" | "bottom" | "left" | "right";
}

export function MorphingSquare({
  className,
  message,
  messagePlacement = "bottom",
  ...props
}: HTMLMotionProps<"div"> & MorphingSquareProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(morphingSquareVariants({ messagePlacement }))}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className={cn(
          "h-10 w-10 border-2 border-black bg-[#dfff3f] shadow-[3px_4px_0_#000]",
          className,
        )}
        animate={
          reduceMotion
            ? { opacity: [1, 0.65, 1] }
            : { borderRadius: ["6%", "50%", "6%"], rotate: [0, 180, 360] }
        }
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        aria-hidden="true"
        {...props}
      />
      {message ? <span>{message}</span> : <span className="sr-only">Жүктелуде...</span>}
    </div>
  );
}
