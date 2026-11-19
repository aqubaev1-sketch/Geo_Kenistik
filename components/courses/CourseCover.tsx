import { BookOpen } from 'lucide-react';

function optimizedCloudinaryUrl(url?: string | null) {
  if (!url || !url.includes('res.cloudinary.com/') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_1200,c_limit/');
}

export function CourseCover({url,className='h-36'}:{url?:string|null;className?:string}){
  const source=optimizedCloudinaryUrl(url);
  return <div className={`relative grid overflow-hidden bg-[radial-gradient(circle_at_75%_20%,#ff9bd9_0,transparent_34%),linear-gradient(135deg,#dfff3f_0%,#7ee6ff_100%)] ${className}`}>{source?<img src={source} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"/>:<div className="grid h-full w-full place-items-center text-black"><span className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-black bg-[#fffef8] shadow-[5px_6px_0_#000]"><BookOpen className="h-8 w-8" aria-hidden="true"/></span></div>}</div>;
}
