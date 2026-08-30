import { getBead, PRODUCT_LABELS } from '../data/beads';
import type { PlacedBead, ProductKind } from './types';

export type JewelryExportInput = {
  name: string;
  kind: ProductKind;
  cordColor: string;
  beads: PlacedBead[];
  closed?: boolean;
  createdAt?: number;
};

function safeFilePart(name: string) {
  return name.trim().replace(/[^\w\u0590-\u05FF\- ]+/g, '').slice(0, 40) || 'machrezet';
}

function drawRoundBead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  highlight: string,
  letter?: string,
) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, highlight);
  g.addColorStop(0.45, color);
  g.addColorStop(1, color);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(43,40,38,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (letter) {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `700 ${Math.max(10, r * 0.95)}px Alef, Frank Ruhl Libre, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x, y + 1);
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s, -s * 0.35, -s * 0.55, -s * 0.95, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.55, -s * 0.95, s, -s * 0.35, 0, s * 0.3);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const spikes = 5;
  const outer = r;
  const inner = r * 0.45;
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
  for (let i = 0; i < spikes; i++) {
    rot += step;
    ctx.lineTo(x + Math.cos(rot) * inner, y + Math.sin(rot) * inner);
    rot += step;
    ctx.lineTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** כרטיס תכשיט יפה ל־PNG (לשמירה / שיתוף) */
export async function renderJewelryCard(input: JewelryExportInput): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unsupported');

  // רקע קרם
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#F9F6F0');
  bg.addColorStop(0.55, '#F3EBE0');
  bg.addColorStop(1, '#E8DFD2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // מסגרת רכה
  ctx.strokeStyle = 'rgba(45,90,76,0.18)';
  ctx.lineWidth = 8;
  roundRect(ctx, 36, 36, W - 72, H - 72, 48);
  ctx.stroke();

  // כותרת מותג
  ctx.fillStyle = '#2D5A4C';
  ctx.font = '700 64px "Frank Ruhl Libre", Alef, serif';
  ctx.textAlign = 'center';
  ctx.fillText('מחרזת', W / 2, 130);

  ctx.fillStyle = '#5C5650';
  ctx.font = '600 28px Alef, sans-serif';
  ctx.fillText(PRODUCT_LABELS[input.kind], W / 2, 180);

  // שם היצירה
  ctx.fillStyle = '#2B2826';
  ctx.font = '700 44px Alef, sans-serif';
  const name = input.name.trim() || 'היצירה שלי';
  ctx.fillText(name.length > 28 ? `${name.slice(0, 27)}…` : name, W / 2, 250);

  // אזור החוט
  const cx = W / 2;
  const cy = 560;
  const rx = 340;
  const ry = input.kind === 'necklace' ? 210 : 150;
  const defs = input.beads.map((b) => getBead(b.beadId)).filter(Boolean);

  // חוט
  ctx.strokeStyle = input.cordColor;
  ctx.lineWidth = input.closed || input.kind === 'bracelet' ? 10 : 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (input.closed && input.kind !== 'ornament') {
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  } else if (input.kind === 'ornament') {
    ctx.moveTo(cx, cy - 220);
    ctx.quadraticCurveTo(cx, cy - 40, cx, cy + 40);
  } else {
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.15, Math.PI * 1.85, true);
  }
  ctx.stroke();

  const n = Math.max(defs.length, 1);
  defs.forEach((bead, i) => {
    if (!bead) return;
    const t = defs.length === 1 ? 0.5 : i / (n - 1);
    let x: number;
    let y: number;
    if (input.closed && input.kind !== 'ornament') {
      const a = -Math.PI / 2 + t * Math.PI * 2;
      x = cx + Math.cos(a) * rx;
      y = cy + Math.sin(a) * ry;
    } else if (input.kind === 'ornament') {
      x = cx;
      y = cy - 160 + t * 280;
    } else {
      const a = Math.PI * 1.15 + t * (Math.PI * 1.85 - Math.PI * 1.15);
      x = cx + Math.cos(a) * rx;
      y = cy + Math.sin(a) * ry;
    }

    const baseR =
      bead.size === 'lg' ? 34 : bead.size === 'md' ? 28 : bead.size === 'sm' ? 22 : 16;

    if (bead.shape === 'heart') {
      drawHeart(ctx, x, y + 8, baseR * 1.1, bead.color);
    } else if (bead.shape === 'star') {
      drawStar(ctx, x, y, baseR * 1.15, bead.color);
    } else {
      drawRoundBead(ctx, x, y, baseR, bead.color, bead.highlight || '#fff', bead.letter);
    }
  });

  // תאריך
  const dateLabel = new Date(input.createdAt ?? Date.now()).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  ctx.fillStyle = '#5C5650';
  ctx.font = '600 26px Alef, sans-serif';
  ctx.fillText(dateLabel, W / 2, H - 90);
  ctx.font = '500 22px Alef, sans-serif';
  ctx.fillText('נוצר במחרזת · נשמר במכשיר', W / 2, H - 55);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('toBlob failed'));
      else resolve(blob);
    }, 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export async function shareOrDownloadJewelry(
  input: JewelryExportInput,
): Promise<'shared' | 'downloaded'> {
  const blob = await renderJewelryCard(input);
  const filename = `machrezet-${safeFilePart(input.name)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });
  const title = `${input.name} · מחרזת`;

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  if (typeof nav.share === 'function') {
    try {
      const data: ShareData = { title, text: 'התכשיט שלי ממחרזת ✨', files: [file] };
      if (!nav.canShare || nav.canShare(data)) {
        await nav.share(data);
        return 'shared';
      }
    } catch (err) {
      // ביטול משתמש — לא מורידים בכוח
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'downloaded';
      }
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}

export async function downloadJewelryOnly(input: JewelryExportInput): Promise<void> {
  const blob = await renderJewelryCard(input);
  downloadBlob(blob, `machrezet-${safeFilePart(input.name)}.png`);
}
