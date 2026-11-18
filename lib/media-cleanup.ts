import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { assignments, courses, lessons, mediaAssets } from '@/db/schema';
import { getCloudinary } from '@/lib/cloudinary';

export type MediaReference={kind:'course'|'lesson'|'assignment';id:string};
type CleanupResult={status:'deleted'|'in_use'|'not_found'|'forbidden'|'unsupported'|'failed';references?:MediaReference[]};
const object=(value:unknown)=>value&&typeof value==='object'?value as Record<string,unknown>:{};

export async function findMediaAssetReferences(assetId:string,publicId?:string|null):Promise<MediaReference[]>{
  const references:MediaReference[]=[];
  const courseRows=await db.select({id:courses.id}).from(courses).where(eq(courses.coverMediaId,assetId));for(const row of courseRows)references.push({kind:'course',id:row.id});
  const lessonRows=await db.select({id:lessons.id,content:lessons.content}).from(lessons);for(const row of lessonRows){const blocks=Array.isArray(row.content)?row.content:[];if(blocks.some(item=>{const block=object(item);return String(block.assetId||'')===assetId||Boolean(publicId&&String(block.publicId||'')===publicId)}))references.push({kind:'lesson',id:row.id});}
  const assignmentRows=await db.select({id:assignments.id,prompt:assignments.prompt}).from(assignments);for(const row of assignmentRows){const prompt=object(row.prompt);if(String(prompt.imageAssetId||'')===assetId||Boolean(publicId&&String(prompt.imagePublicId||'')===publicId))references.push({kind:'assignment',id:row.id});}
  return references;
}

export async function deleteMediaAssetIfUnused(assetId:string,userId:string,role:string):Promise<CleanupResult>{
  const asset=await db.query.mediaAssets.findFirst({where:eq(mediaAssets.id,assetId)});if(!asset)return{status:'not_found'};
  if(role!=='admin'&&asset.uploadedBy!==userId)return{status:'forbidden'};
  if(asset.storageProvider!=='cloudinary'||!asset.objectKey)return{status:'unsupported'};
  const references=await findMediaAssetReferences(asset.id,asset.objectKey);if(references.length)return{status:'in_use',references};
  try{const {client}=getCloudinary();const result=await client.uploader.destroy(asset.objectKey,{resource_type:'image',invalidate:true});if(!['ok','not found'].includes(String(result.result)))return{status:'failed'};await db.delete(mediaAssets).where(eq(mediaAssets.id,asset.id));return{status:'deleted'};}catch(error){console.error('Unused media cleanup failed',error);return{status:'failed'};}
}
