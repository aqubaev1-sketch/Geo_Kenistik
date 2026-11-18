import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { PublicationIssue } from '@/lib/course-publication';

export function PublicationReadiness({issues,isPublished}:{issues:PublicationIssue[];isPublished:boolean}){
  const ready=issues.length===0;
  return <section aria-labelledby="publication-readiness" className={`mb-7 rounded-[22px] border p-5 ${ready?'border-emerald-200 bg-emerald-50':'border-amber-200 bg-amber-50'}`}><div className="flex items-start gap-3">{ready?<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"/>:<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"/>}<div className="min-w-0"><h2 id="publication-readiness" className={`font-bold ${ready?'text-emerald-900':'text-amber-950'}`}>{ready?'Курс жариялауға дайын':isPublished?'Жарияланған курста түзететін тұстар бар':'Курсты жариялау үшін түзетіңіз'}</h2>{ready?<p className="mt-1 text-sm leading-6 text-emerald-800">Атауы, мұқабасы, сабағы және тапсырмалары тексерілді.</p>:<><p className="mt-1 text-sm leading-6 text-amber-900">{issues.length} мәселе табылды:</p><ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">{issues.map((issue,index)=><li key={`${issue.code}-${issue.assignmentId||issue.lessonId||index}`} className="flex gap-2"><span aria-hidden="true">•</span><span>{issue.message}</span></li>)}</ul></>}</div></div></section>;
}
