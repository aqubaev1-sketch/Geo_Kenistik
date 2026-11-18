import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export function getCloudinary() {
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary сервер параметрлері толық орнатылмаған');
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return { client: cloudinary, cloudName, apiKey, apiSecret };
}

export function userMediaFolder(userId: string) {
  return `geokenistik/${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

export function ownsCloudinaryAsset(publicId: string, userId: string) {
  return publicId.startsWith(`${userMediaFolder(userId)}/`);
}
