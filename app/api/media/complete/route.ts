import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { mediaAssets } from '@/db/schema';
import { auth } from '@/lib/auth';
import { ALLOWED_IMAGE_TYPES, getCloudinary, MAX_IMAGE_BYTES, ownsCloudinaryAsset } from '@/lib/cloudinary';

const formatMime: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' };

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  const role = String(session.user.role);
  if (!['teacher', 'admin'].includes(role)) return NextResponse.json({ error: 'Қолжетімділік жоқ' }, { status: 403 });
  let body: { publicId?: unknown; originalName?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Сұрау пішімі қате' }, { status: 400 }); }
  const publicId = String(body.publicId ?? '').trim();
  const originalName = String(body.originalName ?? '').trim().slice(0, 255);
  if (!publicId || (role !== 'admin' && !ownsCloudinaryAsset(publicId, session.user.id))) return NextResponse.json({ error: 'Файл идентификаторы рұқсат етілмеген' }, { status: 403 });

  try {
    const existing = await db.query.mediaAssets.findFirst({ where: and(eq(mediaAssets.storageProvider, 'cloudinary'), eq(mediaAssets.objectKey, publicId)) });
    if (existing) return NextResponse.json({ asset: existing });
    const { client } = getCloudinary();
    const resource = await client.api.resource(publicId, { resource_type: 'image' });
    const mimeType = formatMime[String(resource.format).toLowerCase()] ?? '';
    if (!ALLOWED_IMAGE_TYPES.has(mimeType) || Number(resource.bytes) > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'Файл талаптарға сәйкес емес' }, { status: 400 });
    const [asset] = await db.insert(mediaAssets).values({ storageProvider: 'cloudinary', objectKey: publicId, publicUrl: String(resource.secure_url), fileName: originalName || `${publicId}.${resource.format}`, mimeType, fileSize: Number(resource.bytes), uploadedBy: session.user.id }).returning();
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Cloudinary completion failed', error);
    return NextResponse.json({ error: 'Файлды растау мүмкін болмады' }, { status: 502 });
  }
}
