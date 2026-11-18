'use client';

import { useMemo, useState } from 'react';
import katex from 'katex';
import { ArrowDown, ArrowUp, Heading2, ImageIcon, ListPlus, Play, Plus, Save, Sigma, Trash2, Type } from 'lucide-react';
import { getYouTubeId, type LessonBlock, type LessonBlockType } from '@/lib/lesson-content';

const choices: {type: LessonBlockType; label: string; icon: typeof Type}[] = [
  {type:'heading',label:'Тақырып',icon:Heading2}, {type:'text',label:'Мәтін',icon:Type},
  {type:'formula',label:'Формула',icon:Sigma}, {type:'image',label:'Сурет',icon:ImageIcon},
  {type:'youtube',label:'YouTube',icon:Play},
];

function freshBlock(type: LessonBlockType): LessonBlock {
  return {id:crypto.randomUUID(),type,text:'',url:'',alt:'',caption:''};
}

function FormulaPreview({value}:{value:string}) {
  const html=useMemo(()=>{try{return katex.renderToString(value||'a^2+b^2=c^2',{throwOnError:false,displayMode:true})}catch{return ''}},[value]);
  return <div className="min-w-0 max-w-full overflow-hidden rounded-xl bg-indigo-50 px-4 py-5 text-center" dangerouslySetInnerHTML={{__html:html}}/>;
}

function BlockPreview({block}:{block:LessonBlock}) {
  if(block.type==='heading') return <h2 className="max-w-full break-words [overflow-wrap:anywhere] text-2xl font-bold tracking-[-.025em] text-slate-900">{block.text||'Бөлім тақырыбы'}</h2>;
  if(block.type==='text') return <p className="max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[15px] leading-7 text-slate-600">{block.text||'Сабақ мәтіні осы жерде көрінеді.'}</p>;
  if(block.type==='formula') return <FormulaPreview value={block.text||''}/>;
  if(block.type==='image') return block.url?<figure><img src={block.url} alt={block.alt||''} className="max-h-[380px] w-full rounded-2xl bg-slate-100 object-contain"/><figcaption className="mt-2 text-center text-xs text-slate-400">{block.caption}</figcaption></figure>:<div className="grid h-44 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">Сурет сілтемесін енгізіңіз</div>;
  const id=getYouTubeId(block.url||'');
  return id?<a href={block.url} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-2xl bg-slate-950"><img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="YouTube бейнесінің мұқабасы" className="aspect-video w-full object-cover opacity-90 transition group-hover:opacity-75"/><span className="absolute inset-0 grid place-items-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow-xl"><Play className="ml-1 h-7 w-7 fill-current"/></span></span></a>:<div className="grid h-44 place-items-center rounded-2xl border border-dashed border-red-200 bg-red-50 text-sm text-red-500">Дұрыс YouTube сілтемесін енгізіңіз</div>;
}

export function LessonBlockEditor({lesson,action}:{lesson:{title:string;summary:string;content:unknown;isPublished:boolean};action:(formData:FormData)=>void|Promise<void>}) {
  const initial=Array.isArray(lesson.content)?lesson.content as LessonBlock[]:[];
  const [blocks,setBlocks]=useState<LessonBlock[]>(initial);
  const [adding,setAdding]=useState(false);
  const updateBlock=(id:string,patch:Partial<LessonBlock>)=>setBlocks(items=>items.map(item=>item.id===id?{...item,...patch}:item));
  const removeBlock=(id:string)=>setBlocks(items=>items.filter(item=>item.id!==id));
  const moveBlock=(index:number,offset:number)=>setBlocks(items=>{const target=index+offset;if(target<0||target>=items.length)return items;const copy=[...items];[copy[index],copy[target]]=[copy[target],copy[index]];return copy});
  const addBlock=(type:LessonBlockType)=>{setBlocks(items=>[...items,freshBlock(type)]);setAdding(false)};

  return <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
    <input type="hidden" name="contentJson" value={JSON.stringify(blocks)}/>
    <section className="min-w-0 space-y-5">
      <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6">
        <label className="block text-xs font-bold text-slate-500">САБАҚ АТАУЫ<input name="title" required defaultValue={lesson.title} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"/></label>
        <label className="block text-xs font-bold text-slate-500">ҚЫСҚАША СИПАТТАМА<textarea name="summary" defaultValue={lesson.summary} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-indigo-400"/></label>
      </div>
      {blocks.map((block,index)=><article key={block.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(79,70,229,.04)]">
        <div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">{choices.find(x=>x.type===block.type)?.label}</span><div className="flex gap-1"><button type="button" onClick={()=>moveBlock(index,-1)} disabled={index===0} aria-label="Жоғары жылжыту" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4"/></button><button type="button" onClick={()=>moveBlock(index,1)} disabled={index===blocks.length-1} aria-label="Төмен жылжыту" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4"/></button><button type="button" onClick={()=>removeBlock(block.id)} aria-label="Блокты жою" className="rounded-lg p-2 text-rose-400 hover:bg-rose-50"><Trash2 className="h-4 w-4"/></button></div></div>
        {block.type==='heading'&&<input value={block.text||''} onChange={e=>updateBlock(block.id,{text:e.target.value})} placeholder="Бөлім тақырыбы" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-lg font-bold outline-none focus:border-indigo-400"/>}
        {block.type==='text'&&<textarea value={block.text||''} onChange={e=>updateBlock(block.id,{text:e.target.value})} placeholder="Теорияны, мысалдарды және түсіндірмені жазыңыз..." className="min-h-48 w-full rounded-xl border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-indigo-400"/>}
        {block.type==='formula'&&<div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><textarea value={block.text||''} onChange={e=>updateBlock(block.id,{text:e.target.value})} placeholder="\frac{a+b}{2}" className="min-h-32 min-w-0 rounded-xl border border-slate-200 p-4 font-mono text-sm outline-none focus:border-indigo-400"/><FormulaPreview value={block.text||''}/></div>}
        {block.type==='image'&&<div className="space-y-3"><input value={block.url||''} onChange={e=>updateBlock(block.id,{url:e.target.value})} type="url" placeholder="https://.../image.jpg" className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"/><div className="grid gap-3 sm:grid-cols-2"><input value={block.alt||''} onChange={e=>updateBlock(block.id,{alt:e.target.value})} placeholder="Суреттің сипаттамасы" className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"/><input value={block.caption||''} onChange={e=>updateBlock(block.id,{caption:e.target.value})} placeholder="Сурет астындағы жазу" className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"/></div><BlockPreview block={block}/></div>}
        {block.type==='youtube'&&<div className="space-y-4"><input value={block.url||''} onChange={e=>updateBlock(block.id,{url:e.target.value})} type="url" placeholder="https://www.youtube.com/watch?v=..." className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"/><BlockPreview block={block}/></div>}
      </article>)}
      {blocks.length===0&&<div className="rounded-[24px] border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-14 text-center"><ListPlus className="mx-auto h-8 w-8 text-indigo-400"/><h2 className="mt-4 text-lg font-bold text-slate-800">Сабақ материалы әлі бос</h2><p className="mt-2 text-sm text-slate-500">Алғашқы мәтін, формула немесе бейне блогын қосыңыз.</p></div>}
      <div className="relative"><button type="button" onClick={()=>setAdding(value=>!value)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 text-sm font-bold text-indigo-600"><Plus className="h-4 w-4"/>Материал қосу</button>{adding&&<div className="absolute bottom-14 left-0 z-10 grid w-[280px] grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">{choices.map(({type,label,icon:Icon})=><button type="button" key={type} onClick={()=>addBlock(type)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"><Icon className="h-4 w-4"/>{label}</button>)}</div>}</div>
    </section>
    <aside className="min-w-0 h-fit space-y-5 xl:sticky xl:top-28">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6"><h2 className="text-base font-bold text-slate-900">Жариялау</h2><label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input name="isPublished" type="checkbox" defaultChecked={lesson.isPublished} className="mt-1 h-4 w-4 accent-indigo-500"/><span><b className="block text-sm">Сабақ дайын</b><span className="mt-1 block text-xs leading-5 text-slate-500">Оқушыға көрсетуге дайын деп белгілеу</span></span></label><button className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 text-sm font-bold text-white"><Save className="h-4 w-4"/>Өзгерістерді сақтау</button></div>
      <div className="min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6"><p className="text-xs font-bold text-indigo-600">АЛДЫН АЛА ҚАРАУ</p><div className="mt-5 min-w-0 space-y-6">{blocks.map(block=><div key={block.id} className="min-w-0 max-w-full overflow-hidden"><BlockPreview block={block}/></div>)}</div>{blocks.length===0&&<p className="mt-3 text-sm leading-6 text-slate-400">Материал қосылғанда сабақтың көрінісі осында шығады.</p>}</div>
    </aside>
  </form>;
}
