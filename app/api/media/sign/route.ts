import { randomUUID } from 'node:crypto';
import { auth } from '@/lib/auth';
import { ALLOWED_IMAGE_TYPES, getCloudinary, MAX_IMAGE_BYTES, userMediaFolder } from '@/lib/cloudinary';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Авторизация қажет' }, { status: 401 });
  if (!['teacher', 'admin'].includes(String(session.user.role))) return NextResponse.json({ error: 'Қолжетімділік жоқ' }, { status: 403 });

  let body: { fileName?: unknown; contentType?: unknown; fileSize?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Сұрау пішімі қате' }, { status: 400 }); }
  const fileName = String(body.fileName ?? '').trim();
  const contentType = String(body.contentType ?? '').toLowerCase();
  const fileSize = Number(body.fileSize);
  if (!fileName || fileName.length > 255) return NextResponse.json({ error: 'Файл атауы қате' }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) return NextResponse.json({ error: 'Тек JPG, PNG, WebP, GIF немесе AVIF суреті рұқсат етіледі' }, { status: 400 });
  if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'Файл көлемі 10 МБ-тан аспауы керек' }, { status: 400 });

  try {
    const { client, cloudName, apiKey, apiSecret } = getCloudinary();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = userMediaFolder(session.user.id);
    const publicId = randomUUID();
    const signature = client.utils.api_sign_request({ timestamp, folder, public_id: publicId }, apiSecret);
    return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder, publicId, uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` });
  } catch (error) {
    console.error('Cloudinary signing failed', error);
    return NextResponse.json({ error: 'Файл қоймасы уақытша қолжетімсіз' }, { status: 503 });
  }
}
