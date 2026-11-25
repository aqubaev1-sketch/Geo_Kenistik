import katex from 'katex';
import { CheckCircle2, Clock3, RotateCcw, Send, XCircle } from 'lucide-react';
import { submitAssignment } from '@/app/courses/actions';
import { ActionSubmitButton } from '@/components/ui/action-submit-button';

type Task={id:string;title:string;type:string;prompt:unknown;settings:unknown;maxScore:number;position:number};
type Attempt={assignmentId:string;status:string;score:number|null;feedback:string|null;answer:unknown;submittedAt:Date};

function Formula({value}:{value:string}){let html='';try{html=katex.renderToString(value,{throwOnError:false,displayMode:true})}catch{}return <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-xl bg-indigo-50 px-4 py-5 text-center" dangerouslySetInnerHTML={{__html:html}}/>}

export function StudentAssignments({courseId,slug,lessonId,tasks,attempts,heading='Сабақ тапсырмалары',description='Сабақты аяқтау үшін барлық тапсырмаға жауап жіберіңіз.',allowRetry=false}:{courseId:string;slug:string;lessonId:string;tasks:Task[];attempts:Attempt[];heading?:string;description?:string;allowRetry?:boolean}){
  if(!tasks.length)return null;
  return <section className="mt-12 border-t border-slate-100 pt-10">
    <div className="mb-7"><p className="text-xs font-bold text-indigo-600">БІЛІМДІ ТЕКСЕРУ</p><h2 className="mt-2 text-3xl font-bold tracking-[-.03em] text-slate-900">{heading}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div>
    <div className="space-y-5">{tasks.map((task,index)=>{
      const prompt=task.prompt&&typeof task.prompt==='object'?task.prompt as Record<string,unknown>:{};
      const settings=task.settings&&typeof task.settings==='object'?task.settings as Record<string,unknown>:{};
      const kind=String(settings.kind||task.type);const options=Array.isArray(settings.options)?settings.options as {id:string;text:string}[]:[];
      const formula=String(prompt.formula||'');const imageUrl=String(prompt.imageUrl||'');const latest=attempts.find(item=>item.assignmentId===task.id);
      const checked=latest?.status==='checked';const revision=latest?.status==='revision';const correct=checked&&latest.score===task.maxScore;const canRespond=!latest||revision||(allowRetry&&checked&&!correct);
      return <article key={task.id} className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-400">{index+1}-тапсырма</p><h3 className="mt-2 text-xl font-bold text-slate-900">{task.title}</h3></div><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">{task.maxScore} балл</span></div>
        <p className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700">{String(prompt.text||'')}</p>
        {formula&&<div className="mt-4"><Formula value={formula}/></div>}
        {imageUrl&&<div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3"><img src={imageUrl} alt="Тапсырма суреті" className="mx-auto max-h-[420px] rounded-xl object-contain"/></div>}
        {canRespond&&<form action={submitAssignment.bind(null,courseId,slug,lessonId,task.id)} className="mt-6 space-y-3">
          {(kind==='single'||kind==='multiple')&&<div className="space-y-2">{options.map((option,optionIndex)=><label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/30"><input required={kind==='single'} type={kind==='single'?'radio':'checkbox'} name="answer" value={option.id} className="mt-0.5 h-4 w-4 accent-indigo-500"/><span className="text-sm leading-6 text-slate-700"><b className="mr-2 text-slate-400">{optionIndex+1}.</b>{option.text}</span></label>)}</div>}
          {kind==='number'&&<input required name="answer" type="number" step="any" placeholder="Сандық жауапты енгізіңіз" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"/>}
          {kind==='text'&&<textarea required name="answer" placeholder="Жауабыңызды жазыңыз..." className="min-h-32 w-full rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-indigo-400"/>}
          {kind==='formula'&&<textarea required name="answer" placeholder="Формуланы LaTeX форматында жазыңыз..." className="min-h-24 w-full rounded-xl border border-slate-200 p-4 font-mono text-sm outline-none focus:border-indigo-400"/>}
          <ActionSubmitButton
            label={latest?'Қайта орындау':'Жауапты жіберу'}
            pendingLabel="Жіберілуде..."
            successLabel="Жауап сақталды"
            icon={latest?<RotateCcw className="h-4 w-4"/>:<Send className="h-4 w-4"/>}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#dfff3f] px-5 text-sm font-black text-black shadow-[3px_4px_0_#000] transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-[#d4f52f] hover:shadow-[5px_6px_0_#000] active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff3f]/60"
          />
        </form>}
        {latest&&<div className={`mt-5 rounded-2xl border p-4 ${latest.status==='submitted'?'border-amber-200 bg-amber-50':correct?'border-emerald-200 bg-emerald-50':'border-rose-200 bg-rose-50'}`}><div className="flex items-start gap-3">{latest.status==='submitted'?<Clock3 className="mt-0.5 h-5 w-5 text-amber-500"/>:correct?<CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500"/>:<XCircle className="mt-0.5 h-5 w-5 text-rose-500"/>}<div><p className={`text-sm font-bold ${latest.status==='submitted'?'text-amber-700':correct?'text-emerald-700':'text-rose-700'}`}>{latest.status==='submitted'?'Тексеруді күтеді':revision?'Қайта орындау қажет':correct?'Дұрыс жауап':'Жауап дұрыс емес'}</p><p className="mt-1 text-sm leading-6 text-slate-600">{latest.feedback}</p>{checked&&<p className="mt-2 text-xs font-bold text-slate-500">Нәтиже: {latest.score}/{task.maxScore} балл</p>}</div></div></div>}
      </article>
    })}</div>
  </section>
}
