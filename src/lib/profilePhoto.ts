import { PROFILE_PHOTO_MAX_CHARS } from './storage';

/** דחיסת תמונת פרופיל ל־JPEG קטן שמתאים ל־localStorage */
export async function compressImageFile(
  file: File,
  opts: { maxSide?: number; quality?: number } = {},
): Promise<string> {
  const maxSide = opts.maxSide ?? 360;
  const quality = opts.quality ?? 0.82;
  if (!file.type.startsWith('image/')) {
    throw new Error('נא לבחור קובץ תמונה');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('לא ניתן לעבד את התמונה');
  }
  ctx.fillStyle = '#F9F6F0';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  if (dataUrl.length > PROFILE_PHOTO_MAX_CHARS) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.65);
  }
  if (dataUrl.length > PROFILE_PHOTO_MAX_CHARS) {
    throw new Error('התמונה גדולה מדי — נסו תמונה קטנה יותר');
  }
  return dataUrl;
}
