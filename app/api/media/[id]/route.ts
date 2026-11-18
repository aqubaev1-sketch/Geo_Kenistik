import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteMediaAssetIfUnused } from '@/lib/media-cleanup';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  const role = String(session.user.role);
  if (!['teacher', 'admin'].includes(role)) return NextResponse.json({ error: 'Қолжетімділік жоқ' }, { status: 403 });
  const { id } = await context.params;
  const result=await deleteMediaAssetIfUnused(id,session.user.id,role);
  if(result.status==='deleted'||result.status==='not_found')return NextResponse.json({deleted:true});
  if(result.status==='in_use')return NextResponse.json({error:'Файл курс, сабақ немесе тапсырмада қолданылып тұр',references:result.references},{status:409});
  if(result.status==='forbidden')return NextResponse.json({error:'Бұл файлды өшіруге рұқсат жоқ'},{status:403});
  if(result.status==='unsupported')return NextResponse.json({error:'Бұл файлды Cloudinary арқылы өшіру мүмкін емес'},{status:400});
  return NextResponse.json({error:'Файлды өшіру мүмкін болмады'},{status:502});
}
