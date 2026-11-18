export type LessonBlockType = 'heading' | 'text' | 'formula' | 'image' | 'youtube';

export type LessonBlock = {
  id: string;
  type: LessonBlockType;
  text?: string;
  url?: string;
  alt?: string;
  caption?: string;
};

const blockTypes = new Set<LessonBlockType>(['heading', 'text', 'formula', 'image', 'youtube']);

export function getYouTubeId(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname === 'youtu.be') return url.pathname.split('/')[1] || null;
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v');
      const [, kind, id] = url.pathname.split('/');
      if (['embed', 'shorts', 'live'].includes(kind)) return id || null;
    }
  } catch {}
  return null;
}

export function sanitizeLessonBlocks(value: unknown): LessonBlock[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const raw = item as Record<string, unknown>;
    if (!blockTypes.has(raw.type as LessonBlockType)) return [];
    const type = raw.type as LessonBlockType;
    const block: LessonBlock = {
      id: String(raw.id || `block-${index}`).slice(0, 80),
      type,
      text: String(raw.text || '').slice(0, 20000),
      url: String(raw.url || '').trim().slice(0, 1000),
      alt: String(raw.alt || '').slice(0, 240),
      caption: String(raw.caption || '').slice(0, 500),
    };
    if (type === 'youtube' && block.url && !getYouTubeId(block.url)) return [];
    if (type === 'image' && block.url && !/^https?:\/\//i.test(block.url)) return [];
    return [block];
  });
}
