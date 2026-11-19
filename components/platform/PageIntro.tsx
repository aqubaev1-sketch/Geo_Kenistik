import type { ReactNode } from 'react';
import { Doodle } from '@/components/ui/Doodle';

export function PageIntro({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){
  return <div className="relative mb-12 flex min-w-0 flex-col gap-7 overflow-hidden rounded-[30px] border-2 border-black bg-[#fffef8] p-6 shadow-[7px_8px_0_#000] sm:p-9 xl:flex-row xl:items-end xl:justify-between">
    <Doodle variant="rays" className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 rotate-12 text-black/15" />
    <div className="relative min-w-0 max-w-4xl">
      <p className="inline-flex max-w-full rounded-full bg-[#dfff3f] px-4 py-2 text-xs font-black tracking-wide text-black [overflow-wrap:normal]">{eyebrow}</p>
      <h1 className="mt-5 text-[clamp(2.25rem,1.75rem+2.5vw,4.8rem)] leading-[.95] font-black tracking-[-.055em] text-black [overflow-wrap:normal] [text-wrap:balance]">{title}</h1>
      <p className="mt-5 max-w-2xl break-words text-base font-medium leading-7 text-black/65">{description}</p>
    </div>
    {action&&<div className="relative w-full min-w-0 xl:w-auto xl:max-w-[55%] xl:shrink-0">{action}</div>}
  </div>
}
