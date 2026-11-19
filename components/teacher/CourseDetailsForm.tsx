'use client';

import { UniversalImageUploader, type UploadedImage } from '@/components/media/UniversalImageUploader';
import { ActionSubmitButton } from '@/components/ui/action-submit-button';

export function CourseDetailsForm({course,action}:{course:{title:string;description:string;cover:UploadedImage|null};action:(formData:FormData)=>void|Promise<void>}){
  return <form action={action} className="mt-5 space-y-5"><label className="block text-xs font-bold text-slate-500">АТАУЫ<input name="title" defaultValue={course.title} required className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"/></label><label className="block text-xs font-bold text-slate-500">СИПАТТАМА<textarea name="description" defaultValue={course.description} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6"/></label><UniversalImageUploader value={course.cover} namePrefix="cover" label="Курс мұқабасы"/><ActionSubmitButton label="Өзгерістерді сақтау" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"/></form>;
}
