import katex from 'katex';
import { Play } from 'lucide-react';
import { getYouTubeId, sanitizeLessonBlocks, type LessonBlock } from '@/lib/lesson-content';

function Formula({value}:{value:string}){let html='';try{html=katex.renderToString(value,{throwOnError:false,displayMode:true})}catch{}return <div className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-indigo-50 px-5 py-7 text-center" dangerouslySetInnerHTML={{__html:html}}/>}

function ContentBlock({block}:{block:LessonBlock}){
  if(block.type === 'heading')return <h2 className="break-words [overflow-wrap:anywhere] text-2xl font-bold tracking-[-.025em] text-slate-900 sm:text-3xl">{block.text}</h2>;
  if(block.type === 'text')return <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-base leading-8 text-slate-600">{block.text}</p>;
  if(block.type === 'formula')return <Formula value={block.text||''}/>;
  if(block.type === 'image')return <figure><img src={block.url} alt={block.alt||''} className="max-h-[620px] w-full rounded-2xl bg-slate-100 object-contain"/><figcaption className="mt-3 text-center text-sm text-slate-400">{block.caption}</figcaption></figure>;
  if(block.type === 'youtube'){const id=getYouTubeId(block.url||'');return id?<div className="aspect-video overflow-hidden rounded-2xl bg-slate-950"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="YouTube бейнесабағы" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div>:<div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-5 text-sm text-slate-500"><Play className="h-5 w-5"/>Бейне сілтемесі қолжетімсіз</div>}
  return null;
}

export function LessonContentRenderer({content}:{content:unknown}){const blocks=sanitizeLessonBlocks(content);if(!blocks.length)return <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">Бұл сабақтың материалы әлі қосылмаған.</div>;return <div className="min-w-0 space-y-8">{blocks.map(block=><ContentBlock key={block.id} block={block}/>)}</div>}
