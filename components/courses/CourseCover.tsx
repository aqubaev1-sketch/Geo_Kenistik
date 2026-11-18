import { BookOpen } from 'lucide-react';

export function CourseCover({url,className='h-36'}:{url?:string|null;className?:string}){
  return <div className={`relative grid overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-500 ${className}`}>{url?<img src={url} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full w-full place-items-center text-white/90"><BookOpen className="h-9 w-9" aria-hidden="true"/></div>}</div>;
}
