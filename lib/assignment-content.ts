export type AssignmentKind = 'single'|'multiple'|'number'|'text'|'formula';
export type AssignmentOption = {id:string;text:string};
export type AssignmentPayload = {
  title:string; kind:AssignmentKind; prompt:{text:string;imageUrl:string;imagePublicId:string;imageAssetId:string;formula:string};
  options:AssignmentOption[]; correctAnswers:string[]; correctAnswer:string;
  sampleAnswer:string; explanation:string; tolerance:number; maxScore:number;
};

const kinds=new Set<AssignmentKind>(['single','multiple','number','text','formula']);
const text=(value:unknown,max:number)=>String(value??'').trim().slice(0,max);

export function sanitizeAssignmentPayload(value:unknown):AssignmentPayload{
  const raw=value&&typeof value==='object'?value as Record<string,unknown>:{};
  const promptRaw=raw.prompt&&typeof raw.prompt==='object'?raw.prompt as Record<string,unknown>:{};
  const kind=kinds.has(raw.kind as AssignmentKind)?raw.kind as AssignmentKind:'single';
  const options=Array.isArray(raw.options)?raw.options.slice(0,12).map((item,index)=>{const option=item&&typeof item==='object'?item as Record<string,unknown>:{};return{id:text(option.id||`option-${index}`,80),text:text(option.text,500)}}).filter(item=>item.text):[];
  const optionIds=new Set(options.map(item=>item.id));
  const correctAnswers=Array.isArray(raw.correctAnswers)?raw.correctAnswers.map(item=>text(item,80)).filter(id=>optionIds.has(id)):[];
  const imageUrl=text(promptRaw.imageUrl,1000);
  return {title:text(raw.title,160),kind,prompt:{text:text(promptRaw.text,5000),imageUrl:/^https?:\/\//i.test(imageUrl)?imageUrl:'',imagePublicId:text(promptRaw.imagePublicId,500),imageAssetId:text(promptRaw.imageAssetId,80),formula:text(promptRaw.formula,2000)},options,correctAnswers,correctAnswer:text(raw.correctAnswer,1000),sampleAnswer:text(raw.sampleAnswer,5000),explanation:text(raw.explanation,5000),tolerance:Math.max(0,Math.min(1000000,Number(raw.tolerance)||0)),maxScore:Math.max(1,Math.min(100,Math.round(Number(raw.maxScore)||1)))};
}
