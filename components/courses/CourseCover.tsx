import { BookOpen } from 'lucide-react';

function optimizedCloudinaryUrl(url?: string | null) {
  if (!url || !url.includes('res.cloudinary.com/') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200,c_limit/');
}

export function CourseCover({url,className='h-36'}:{url?:string|null;className?:string}){
  const source=optimizedCloudinaryUrl(url);
  return <div className={`relative grid overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-500 ${className}`}>{source?<img src={source} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"/>:<div className="grid h-full w-full place-items-center text-white/90"><BookOpen className="h-9 w-9" aria-hidden="true"/></div>}</div>;
}
