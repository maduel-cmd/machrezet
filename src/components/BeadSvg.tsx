import type { BeadDef } from '../lib/types';
import { beadPixelSize, materialFor, type MaterialRecipe } from '../lib/materials';

type Props = {
  bead: BeadDef;
  /** Unique id for SVG defs when multiple instances share bead.id */
  instanceKey?: string;
  widthPx?: number;
  heightPx?: number;
  /**
   * Strand mode: solid 3D body, no visible drill-hole.
   * Catalog/palette may still request a hole with showHole.
   */
  solid?: boolean;
  /** Paint a small cord-colored hole (palette only; ignored when solid). */
  showHole?: boolean;
  /** When true, letter is drawn by StrandCanvas (upright overlay). */
  deferLetter?: boolean;
  cordColor?: string;
  className?: string;
};

function shade(hex: string, amount: number): string {
  const n = hex.replace('#', '');
  if (n.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function withAlpha(hex: string, alpha: number): string {
  const n = hex.replace('#', '');
  if (n.length !== 6) return hex;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** לב תכשיט — path יחסי למרכז */
function heartPath(cx: number, cy: number, rx: number, ry: number): string {
  const top = cy - ry * 0.35;
  const bottom = cy + ry * 0.92;
  const left = cx - rx * 0.95;
  const right = cx + rx * 0.95;
  return [
    `M ${cx} ${bottom}`,
    `C ${left} ${cy + ry * 0.25} ${left} ${top - ry * 0.15} ${cx - rx * 0.08} ${top + ry * 0.2}`,
    `C ${cx - rx * 0.35} ${top - ry * 0.35} ${cx} ${top - ry * 0.05} ${cx} ${top + ry * 0.28}`,
    `C ${cx} ${top - ry * 0.05} ${cx + rx * 0.35} ${top - ry * 0.35} ${cx + rx * 0.08} ${top + ry * 0.2}`,
    `C ${right} ${top - ry * 0.15} ${right} ${cy + ry * 0.25} ${cx} ${bottom}`,
    'Z',
  ].join(' ');
}

/** כוכב 5 קודקודים */
function starPath(cx: number, cy: number, rx: number, ry: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 1 : 0.42;
    points.push(`${cx + Math.cos(ang) * rx * r},${cy + Math.sin(ang) * ry * r}`);
  }
  return `M ${points.join(' L ')} Z`;
}

/** ירח סהר */
function crescentPath(cx: number, cy: number, rx: number, ry: number): string {
  const outer = `M ${cx + rx * 0.15} ${cy - ry} A ${rx} ${ry} 0 1 0 ${cx + rx * 0.15} ${cy + ry}`;
  const inner = `A ${rx * 0.72} ${ry * 0.78} 0 1 1 ${cx + rx * 0.15} ${cy - ry}`;
  return `${outer} ${inner} Z`;
}

/** עלה */
function leafPath(cx: number, cy: number, rx: number, ry: number): string {
  const tip = cy - ry * 0.95;
  const base = cy + ry * 0.9;
  return [
    `M ${cx} ${tip}`,
    `C ${cx + rx * 0.95} ${cy - ry * 0.35} ${cx + rx * 0.7} ${cy + ry * 0.45} ${cx} ${base}`,
    `C ${cx - rx * 0.7} ${cy + ry * 0.45} ${cx - rx * 0.95} ${cy - ry * 0.35} ${cx} ${tip}`,
    'Z',
  ].join(' ');
}

/** צדף */
function shellPath(cx: number, cy: number, rx: number, ry: number): string {
  const top = cy - ry * 0.85;
  const bottom = cy + ry * 0.88;
  return [
    `M ${cx} ${top}`,
    `C ${cx + rx * 0.35} ${top + ry * 0.1} ${cx + rx * 1.05} ${cy - ry * 0.1} ${cx + rx * 0.95} ${cy + ry * 0.35}`,
    `C ${cx + rx * 0.75} ${bottom} ${cx + rx * 0.25} ${bottom} ${cx} ${bottom - ry * 0.08}`,
    `C ${cx - rx * 0.25} ${bottom} ${cx - rx * 0.75} ${bottom} ${cx - rx * 0.95} ${cy + ry * 0.35}`,
    `C ${cx - rx * 1.05} ${cy - ry * 0.1} ${cx - rx * 0.35} ${top + ry * 0.1} ${cx} ${top}`,
    'Z',
  ].join(' ');
}

/** פרח 5 עלי כותרת */
function flowerPath(cx: number, cy: number, rx: number, ry: number): string {
  const petals: string[] = [];
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const px = cx + Math.cos(ang) * rx * 0.55;
    const py = cy + Math.sin(ang) * ry * 0.55;
    petals.push(
      `M ${cx} ${cy} Q ${px + Math.cos(ang - 0.5) * rx * 0.35} ${py + Math.sin(ang - 0.5) * ry * 0.35} ${px} ${py} Q ${px + Math.cos(ang + 0.5) * rx * 0.35} ${py + Math.sin(ang + 0.5) * ry * 0.35} ${cx} ${cy}`,
    );
  }
  return petals.join(' ') + ' Z';
}

/** Contrast color for letter/digit glyph on a bead face. */
export function letterGlyphColor(bead: BeadDef): string {
  const bg = bead.color.toLowerCase();
  if (bg === '#1a1a1a' || bg === '#2c2a28') return '#F5F0E8';
  if (bg === '#c9a227') return '#4A3208';
  if (bg === '#4ba3c7') return '#103040';
  if (bg === '#e091a8') return '#5A2040';
  if (bg === '#f8f4ec') return '#1c1916';
  return '#1c1916';
}

function finishOpacity(recipe: MaterialRecipe): { gloss: number; rim: number } {
  switch (recipe.finish) {
    case 'crystal':
      return { gloss: 1, rim: 0.95 };
    case 'pearl':
      return { gloss: 0.62, rim: 0.7 };
    case 'gem':
      return { gloss: 0.98, rim: 0.92 };
    case 'metal':
      return { gloss: 0.95, rim: 0.85 };
    case 'wood':
      return { gloss: 0.3, rim: 0.4 };
    case 'matte':
      return { gloss: 0.35, rim: 0.45 };
    case 'acrylic':
      return { gloss: 0.72, rim: 0.65 };
    default:
      return { gloss: 0.85, rim: 0.75 };
  }
}

/**
 * SVG bead sprite — solid 3D body on the strand (no visible hole).
 */
export function BeadSvg({
  bead,
  instanceKey,
  widthPx,
  heightPx,
  solid = true,
  showHole = false,
  deferLetter = false,
  cordColor = '#c4a574',
  className,
}: Props) {
  const recipe = materialFor(bead.category);
  const sized = beadPixelSize(bead.size, bead.shape);
  const w = Math.max(10, widthPx ?? sized.w);
  const h = Math.max(8, heightPx ?? sized.h);
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.48;
  const ry = h * 0.48;
  const paintHole = showHole && !solid;
  const holeRx = Math.max(2.5, w * recipe.holeScale * 0.55);
  const holeRy = Math.max(2, h * (bead.shape === 'disc' ? 0.38 : 0.18));
  const uid = `${bead.id}-${instanceKey ?? 'solo'}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const base = bead.color;
  const hi = bead.highlight ?? shade(base, 70);
  const dark = shade(base, -55);
  const deep = shade(base, -85);
  const isGem = bead.category === 'gemstone' || bead.category === 'crystal';
  const isCrystal = bead.category === 'crystal';
  const isMetal = bead.category === 'metal' || bead.category === 'charm';
  const isCharm = bead.category === 'charm';
  const isWood = bead.category === 'wood';
  const isPony = bead.category === 'pony';
  const isLetter = bead.category === 'letter' || bead.shape === 'cube';
  const isMoonCharm = isCharm && (bead.id.includes('moon') || bead.nameHe.includes('ירח'));
  const isFaceted = bead.shape === 'faceted' || isGem;
  const isRoundish =
    bead.shape === 'round' || bead.shape === 'oval' || bead.shape === 'faceted' || bead.shape === 'disc';
  const charmBodyPath =
    bead.shape === 'heart'
      ? heartPath(cx, cy + ry * 0.06, rx * 0.92, ry * 0.9)
      : bead.shape === 'star'
        ? starPath(cx, cy + ry * 0.04, rx * 0.9, ry * 0.9)
        : bead.shape === 'leaf'
          ? leafPath(cx, cy, rx * 0.88, ry * 0.95)
          : bead.shape === 'shell'
            ? shellPath(cx, cy, rx * 0.92, ry * 0.9)
            : bead.shape === 'flower'
              ? flowerPath(cx, cy, rx * 0.95, ry * 0.95)
              : isMoonCharm
                ? crescentPath(cx, cy, rx * 0.88, ry * 0.88)
                : null;
  const { gloss, rim } = finishOpacity(recipe);
  // על החוט שומרים על מוצקות, אבל לאבנים משאירים יותר עומק פנימי
  const translucency = solid
    ? isGem
      ? recipe.translucency * 0.92
      : recipe.translucency * 0.35
    : recipe.translucency;
  const showLetterHere = Boolean(bead.letter) && !deferLetter;
  const letterSize = Math.max(9, Math.min(w, h) * 0.46);

  const bodyRadius =
    bead.shape === 'cube' ? Math.min(w, h) * 0.14 : bead.shape === 'tube' ? Math.min(w, h) * 0.28 : Math.min(w, h) * 0.22;

  const gemClip = `gem-clip-${uid}`;

  return (
    <svg
      className={
        className ??
        [
          'bead-svg',
          isGem ? 'bead-svg--gem' : '',
          isCrystal ? 'bead-svg--crystal' : '',
          bead.category === 'pearl' ? 'bead-svg--pearl' : '',
          isMetal ? 'bead-svg--metal' : '',
          isCharm ? 'bead-svg--charm' : '',
          isWood ? 'bead-svg--wood' : '',
          isPony ? 'bead-svg--pony' : '',
          isLetter ? 'bead-svg--letter' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        {/* Volume body */}
        <radialGradient id={`bg-${uid}`} cx="28%" cy="24%" r="82%">
          <stop offset="0%" stopColor={hi} />
          <stop offset="28%" stopColor={base} stopOpacity={1 - translucency * 0.25} />
          <stop offset="62%" stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        {/* Inner glow / pavilion for gems */}
        <radialGradient id={`core-${uid}`} cx="48%" cy="58%" r="55%">
          <stop offset="0%" stopColor={withAlpha(hi, isCrystal ? 0.75 : 0.55)} />
          <stop offset="45%" stopColor={withAlpha(base, 0.35)} />
          <stop offset="100%" stopColor={withAlpha(deep, 0)} />
        </radialGradient>

        <radialGradient id={`spec-${uid}`} cx="26%" cy="20%" r="42%">
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        <radialGradient id={`spec2-${uid}`} cx="68%" cy="62%" r="38%">
          <stop offset="0%" stopColor={withAlpha(hi, 0.65)} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
        </linearGradient>

        {/* Dispersion / fire — richer spectral flash */}
        <linearGradient id={`fire-${uid}`} x1="8%" y1="15%" x2="92%" y2="88%">
          <stop offset="0%" stopColor="rgba(255,90,160,0)" />
          <stop offset="22%" stopColor="rgba(255,110,170,0.32)" />
          <stop offset="38%" stopColor="rgba(90,200,255,0.38)" />
          <stop offset="52%" stopColor="rgba(255,230,110,0.3)" />
          <stop offset="68%" stopColor="rgba(170,110,255,0.28)" />
          <stop offset="82%" stopColor="rgba(110,255,210,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <linearGradient id={`caustic-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="32%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="42%" stopColor="rgba(255,255,255,0)" />
          <stop offset="58%" stopColor="rgba(200,235,255,0.45)" />
          <stop offset="68%" stopColor="rgba(255,255,255,0)" />
          <stop offset="82%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <radialGradient id={`orient-${uid}`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="28%" stopColor="rgba(220,200,255,0.28)" />
          <stop offset="52%" stopColor="rgba(180,230,255,0.18)" />
          <stop offset="78%" stopColor="rgba(255,210,230,0.14)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Brushed / jewelry metal */}
        <linearGradient id={`metal-body-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hi} />
          <stop offset="18%" stopColor={shade(base, 35)} />
          <stop offset="38%" stopColor={base} />
          <stop offset="55%" stopColor={shade(base, -25)} />
          <stop offset="72%" stopColor={hi} />
          <stop offset="88%" stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </linearGradient>
        <linearGradient id={`metal-brush-${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="18%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="32%" stopColor="rgba(255,255,255,0)" />
          <stop offset="48%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="62%" stopColor="rgba(255,255,255,0)" />
          <stop offset="78%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id={`metal-bevel-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="70%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </linearGradient>

        {/* Wood grain + varnish */}
        <radialGradient id={`wood-body-${uid}`} cx="32%" cy="28%" r="78%">
          <stop offset="0%" stopColor={hi} />
          <stop offset="40%" stopColor={base} />
          <stop offset="75%" stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
        <linearGradient id={`wood-grain-${uid}`} x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="rgba(40,20,8,0)" />
          <stop offset="18%" stopColor="rgba(40,20,8,0.22)" />
          <stop offset="22%" stopColor="rgba(40,20,8,0)" />
          <stop offset="40%" stopColor="rgba(40,20,8,0.18)" />
          <stop offset="48%" stopColor="rgba(40,20,8,0)" />
          <stop offset="65%" stopColor="rgba(40,20,8,0.2)" />
          <stop offset="72%" stopColor="rgba(40,20,8,0)" />
          <stop offset="88%" stopColor="rgba(40,20,8,0.15)" />
          <stop offset="100%" stopColor="rgba(40,20,8,0)" />
        </linearGradient>
        <radialGradient id={`wood-varnish-${uid}`} cx="28%" cy="22%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="40%" stopColor="rgba(255,240,200,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Pony candy plastic */}
        <radialGradient id={`pony-body-${uid}`} cx="30%" cy="26%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="22%" stopColor={hi} />
          <stop offset="55%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <linearGradient id={`pony-band-${uid}`} x1="0%" y1="40%" x2="0%" y2="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </linearGradient>

        {/* Acrylic letter cube faces */}
        <linearGradient id={`cube-face-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hi} />
          <stop offset="45%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`cube-top-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={withAlpha(hi, 0.95)} />
          <stop offset="100%" stopColor={withAlpha(base, 0.7)} />
        </linearGradient>
        <linearGradient id={`cube-side-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={withAlpha(dark, 0.55)} />
          <stop offset="100%" stopColor={withAlpha(deep, 0.85)} />
        </linearGradient>

        <linearGradient id={`facet-a-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={withAlpha('#ffffff', 0.72)} />
          <stop offset="45%" stopColor={withAlpha(hi, 0.32)} />
          <stop offset="100%" stopColor={withAlpha(deep, 0.4)} />
        </linearGradient>
        <linearGradient id={`facet-b-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={withAlpha(hi, 0.62)} />
          <stop offset="100%" stopColor={withAlpha(deep, 0.5)} />
        </linearGradient>
        <linearGradient id={`facet-c-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={withAlpha('#ffffff', 0.45)} />
          <stop offset="40%" stopColor={withAlpha(base, 0.18)} />
          <stop offset="100%" stopColor={withAlpha(deep, 0.62)} />
        </linearGradient>

        <filter id={`soft-${uid}`} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow
            dx="0"
            dy={isGem || isMetal ? 1.8 : 1.4}
            stdDeviation={isGem || isMetal ? 1.8 : 1.1}
            floodOpacity={isGem || isMetal ? 0.4 : 0.28}
          />
          {isGem || isMetal ? (
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation={isMetal ? 1.6 : 2.2}
              floodColor={withAlpha(hi, 0.55)}
              floodOpacity={isMetal ? 0.35 : 0.45}
            />
          ) : null}
        </filter>

        {isFaceted ? (
          <clipPath id={gemClip}>
            {bead.shape === 'faceted' || bead.category === 'gemstone' ? (
              <polygon
                points={[
                  `${cx},${cy - ry}`,
                  `${cx + rx * 0.55},${cy - ry * 0.45}`,
                  `${cx + rx},${cy}`,
                  `${cx + rx * 0.55},${cy + ry * 0.5}`,
                  `${cx},${cy + ry}`,
                  `${cx - rx * 0.55},${cy + ry * 0.5}`,
                  `${cx - rx},${cy}`,
                  `${cx - rx * 0.55},${cy - ry * 0.45}`,
                ].join(' ')}
              />
            ) : (
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
            )}
          </clipPath>
        ) : null}
      </defs>

      {/* Soft ground contact */}
      <ellipse cx={cx} cy={h * 0.9} rx={rx * 0.78} ry={ry * 0.16} fill="rgba(40,28,16,0.22)" />

      <g filter={solid ? `url(#soft-${uid})` : undefined}>
        {/* Body */}
        {charmBodyPath ? (
          <path d={charmBodyPath} fill={`url(#bg-${uid})`} />
        ) : bead.category === 'letter' || bead.shape === 'cube' ? (
          (() => {
            const pad = Math.min(w, h) * 0.04;
            const depth = Math.min(w, h) * 0.22;
            const x0 = pad;
            const y0 = pad + depth * 0.55;
            const bw = w - pad * 2 - depth * 0.7;
            const bh = h - pad * 2 - depth * 0.55;
            const top = `M ${x0} ${y0} L ${x0 + depth * 0.7} ${y0 - depth} L ${x0 + bw + depth * 0.7} ${y0 - depth} L ${x0 + bw} ${y0} Z`;
            const side = `M ${x0 + bw} ${y0} L ${x0 + bw + depth * 0.7} ${y0 - depth} L ${x0 + bw + depth * 0.7} ${y0 + bh - depth} L ${x0 + bw} ${y0 + bh} Z`;
            return (
              <g>
                <path d={side} fill={`url(#cube-side-${uid})`} />
                <path d={top} fill={`url(#cube-top-${uid})`} />
                <rect
                  x={x0}
                  y={y0}
                  width={bw}
                  height={bh}
                  rx={Math.min(4, bw * 0.12)}
                  fill={`url(#cube-face-${uid})`}
                />
                <rect
                  x={x0}
                  y={y0}
                  width={bw}
                  height={bh}
                  rx={Math.min(4, bw * 0.12)}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={Math.max(0.9, w * 0.03)}
                />
                <path d={top} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
                <path d={side} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={0.8} />
                <ellipse
                  cx={x0 + bw * 0.3}
                  cy={y0 + bh * 0.22}
                  rx={bw * 0.2}
                  ry={bh * 0.1}
                  fill="rgba(255,255,255,0.45)"
                />
              </g>
            );
          })()
        ) : isFaceted && (bead.shape === 'faceted' || bead.category === 'gemstone') ? (
          <polygon
            points={[
              `${cx},${cy - ry}`,
              `${cx + rx * 0.55},${cy - ry * 0.45}`,
              `${cx + rx},${cy}`,
              `${cx + rx * 0.55},${cy + ry * 0.5}`,
              `${cx},${cy + ry}`,
              `${cx - rx * 0.55},${cy + ry * 0.5}`,
              `${cx - rx},${cy}`,
              `${cx - rx * 0.55},${cy - ry * 0.45}`,
            ].join(' ')}
            fill={`url(#bg-${uid})`}
          />
        ) : isRoundish ? (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={
              isMetal
                ? `url(#metal-body-${uid})`
                : isPony
                  ? `url(#pony-body-${uid})`
                  : isWood
                    ? `url(#wood-body-${uid})`
                    : `url(#bg-${uid})`
            }
          />
        ) : (
          <rect
            x={w * 0.05}
            y={h * 0.07}
            width={w * 0.9}
            height={h * 0.86}
            rx={bodyRadius}
            fill={
              isMetal
                ? `url(#metal-body-${uid})`
                : isWood
                  ? `url(#wood-body-${uid})`
                  : isPony
                    ? `url(#pony-body-${uid})`
                    : `url(#bg-${uid})`
            }
          />
        )}

        {/* Metal brushed bands + bevel (rondelles, tubes, ovals, charms) */}
        {isMetal && !isGem ? (
          <g>
            {charmBodyPath ? (
              <>
                <path
                  d={charmBodyPath}
                  fill={`url(#metal-brush-${uid})`}
                  opacity={0.55}
                  style={{ mixBlendMode: 'screen' }}
                />
                <path
                  d={charmBodyPath}
                  fill="none"
                  stroke={`url(#metal-bevel-${uid})`}
                  strokeWidth={Math.max(1.4, w * 0.045)}
                  opacity={0.95}
                />
                <path
                  d={charmBodyPath}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={Math.max(0.7, w * 0.02)}
                  opacity={0.7}
                />
                {/* Inner polish highlight */}
                {bead.shape === 'heart' ? (
                  <ellipse
                    cx={cx - rx * 0.22}
                    cy={cy - ry * 0.15}
                    rx={rx * 0.18}
                    ry={ry * 0.14}
                    fill="rgba(255,255,255,0.55)"
                  />
                ) : null}
                {bead.shape === 'star' ? (
                  <ellipse
                    cx={cx - rx * 0.08}
                    cy={cy - ry * 0.12}
                    rx={rx * 0.16}
                    ry={ry * 0.12}
                    fill="rgba(255,255,255,0.5)"
                  />
                ) : null}
                {bead.shape === 'leaf' || bead.shape === 'shell' || bead.shape === 'flower' ? (
                  <ellipse
                    cx={cx - rx * 0.12}
                    cy={cy - ry * 0.18}
                    rx={rx * 0.16}
                    ry={ry * 0.12}
                    fill="rgba(255,255,255,0.5)"
                  />
                ) : null}
                {isMoonCharm ? (
                  <ellipse
                    cx={cx - rx * 0.15}
                    cy={cy - ry * 0.2}
                    rx={rx * 0.14}
                    ry={ry * 0.22}
                    fill="rgba(255,255,255,0.45)"
                  />
                ) : null}
              </>
            ) : bead.shape === 'tube' ? (
              <>
                <rect
                  x={w * 0.08}
                  y={h * 0.1}
                  width={w * 0.84}
                  height={h * 0.8}
                  rx={bodyRadius}
                  fill={`url(#metal-brush-${uid})`}
                  opacity={0.65}
                  style={{ mixBlendMode: 'screen' }}
                />
                <rect
                  x={w * 0.05}
                  y={h * 0.07}
                  width={w * 0.9}
                  height={h * 0.86}
                  rx={bodyRadius}
                  fill="none"
                  stroke={`url(#metal-bevel-${uid})`}
                  strokeWidth={Math.max(1.2, w * 0.05)}
                />
                {/* Cap rings */}
                <ellipse
                  cx={cx}
                  cy={h * 0.14}
                  rx={rx * 0.78}
                  ry={ry * 0.12}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={1.1}
                />
                <ellipse
                  cx={cx}
                  cy={h * 0.86}
                  rx={rx * 0.78}
                  ry={ry * 0.12}
                  fill="none"
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth={1.1}
                />
              </>
            ) : bead.shape === 'disc' ? (
              <>
                {/* Rondelle edge thickness */}
                <ellipse
                  cx={cx}
                  cy={cy + ry * 0.15}
                  rx={rx * 0.98}
                  ry={ry * 0.55}
                  fill={withAlpha(deep, 0.35)}
                />
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#metal-body-${uid})`} />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.92}
                  ry={ry * 0.78}
                  fill={`url(#metal-brush-${uid})`}
                  opacity={0.7}
                  style={{ mixBlendMode: 'screen' }}
                />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={`url(#metal-bevel-${uid})`}
                  strokeWidth={Math.max(1.4, w * 0.06)}
                />
                <ellipse
                  cx={cx}
                  cy={cy - ry * 0.15}
                  rx={rx * 0.55}
                  ry={ry * 0.28}
                  fill="rgba(255,255,255,0.45)"
                />
              </>
            ) : (
              <>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.95}
                  ry={ry * 0.95}
                  fill={`url(#metal-brush-${uid})`}
                  opacity={0.6}
                  style={{ mixBlendMode: 'screen' }}
                />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.72}
                  ry={ry * 0.72}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={Math.max(1.1, w * 0.05)}
                />
                <path
                  d={`M ${cx - rx * 0.7} ${cy - ry * 0.1} Q ${cx} ${cy - ry * 0.65} ${cx + rx * 0.7} ${cy - ry * 0.05}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={1.3}
                />
                <path
                  d={`M ${cx - rx * 0.55} ${cy + ry * 0.25} Q ${cx} ${cy + ry * 0.55} ${cx + rx * 0.55} ${cy + ry * 0.22}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={1}
                />
              </>
            )}
          </g>
        ) : null}

        {/* Gem / crystal realism layers */}
        {isGem ? (
          <g clipPath={isFaceted ? `url(#${gemClip})` : undefined}>
            {/* Internal pavilion glow */}
            <ellipse cx={cx} cy={cy + ry * 0.08} rx={rx * 0.78} ry={ry * 0.72} fill={`url(#core-${uid})`} />
            <ellipse
              cx={cx + rx * 0.05}
              cy={cy + ry * 0.2}
              rx={rx * 0.35}
              ry={ry * 0.32}
              fill={withAlpha(hi, isCrystal ? 0.45 : 0.32)}
            />

            {/* Table + crown facets */}
            <polygon
              points={`${cx},${cy - ry * 0.92} ${cx + rx * 0.42},${cy - ry * 0.12} ${cx - rx * 0.42},${cy - ry * 0.12}`}
              fill={`url(#facet-a-${uid})`}
              opacity={0.92}
            />
            <polygon
              points={`${cx},${cy - ry * 0.12} ${cx + rx * 0.92},${cy} ${cx + rx * 0.28},${cy + ry * 0.55} ${cx - rx * 0.28},${cy + ry * 0.55} ${cx - rx * 0.92},${cy}`}
              fill={`url(#facet-c-${uid})`}
              opacity={0.62}
            />
            <polygon
              points={`${cx + rx * 0.08},${cy - ry * 0.35} ${cx + rx * 0.88},${cy - ry * 0.05} ${cx + rx * 0.55},${cy + ry * 0.35}`}
              fill={`url(#facet-b-${uid})`}
              opacity={0.82}
            />
            <polygon
              points={`${cx - rx * 0.08},${cy - ry * 0.35} ${cx - rx * 0.88},${cy - ry * 0.05} ${cx - rx * 0.55},${cy + ry * 0.35}`}
              fill={withAlpha(deep, 0.32)}
              opacity={0.95}
            />
            <polygon
              points={`${cx},${cy + ry * 0.05} ${cx + rx * 0.38},${cy + ry * 0.55} ${cx},${cy + ry * 0.9} ${cx - rx * 0.38},${cy + ry * 0.55}`}
              fill={withAlpha(deep, 0.48)}
            />
            {/* Extra kite facets for cut brilliance */}
            <polygon
              points={`${cx},${cy - ry * 0.55} ${cx + rx * 0.32},${cy - ry * 0.08} ${cx},${cy + ry * 0.12} ${cx - rx * 0.32},${cy - ry * 0.08}`}
              fill="rgba(255,255,255,0.22)"
            />
            <polygon
              points={`${cx + rx * 0.35},${cy - ry * 0.15} ${cx + rx * 0.78},${cy + ry * 0.08} ${cx + rx * 0.4},${cy + ry * 0.42}`}
              fill={withAlpha(hi, 0.35)}
            />

            {/* Facet seams */}
            <path
              d={`M ${cx} ${cy - ry * 0.9} L ${cx} ${cy + ry * 0.85} M ${cx - rx * 0.85} ${cy} L ${cx + rx * 0.85} ${cy}
                 M ${cx - rx * 0.45} ${cy - ry * 0.55} L ${cx + rx * 0.55} ${cy + ry * 0.4}
                 M ${cx + rx * 0.45} ${cy - ry * 0.55} L ${cx - rx * 0.55} ${cy + ry * 0.4}`}
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth={Math.max(0.65, w * 0.02)}
            />
            <path
              d={`M ${cx - rx * 0.4} ${cy - ry * 0.5} L ${cx + rx * 0.4} ${cy - ry * 0.5}
                 M ${cx - rx * 0.55} ${cy + ry * 0.2} L ${cx + rx * 0.55} ${cy + ry * 0.2}`}
              fill="none"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={Math.max(0.5, w * 0.014)}
            />

            {/* Dispersion / fire */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx * 0.92}
              ry={ry * 0.92}
              fill={`url(#fire-${uid})`}
              opacity={isCrystal ? 0.95 : 0.82}
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Crystal glass caustics */}
            {isCrystal ? (
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx * 0.88}
                ry={ry * 0.88}
                fill={`url(#caustic-${uid})`}
                opacity={0.7}
                style={{ mixBlendMode: 'overlay' }}
              />
            ) : null}

            {/* Soft specular blob */}
            <ellipse
              cx={cx - rx * 0.32}
              cy={cy - ry * 0.38}
              rx={rx * 0.22}
              ry={ry * 0.13}
              fill="rgba(255,255,255,0.95)"
              opacity={0.95}
            />

            {/* Cross sparkles (star flashes) */}
            <g fill="#fff" opacity={0.95}>
              <rect
                x={cx + rx * 0.2}
                y={cy - ry * 0.22}
                width={Math.max(2.4, w * 0.09)}
                height={Math.max(0.55, h * 0.02)}
                rx={0.25}
              />
              <rect
                x={cx + rx * 0.2 + Math.max(0.9, w * 0.03)}
                y={cy - ry * 0.22 - Math.max(0.9, h * 0.03)}
                width={Math.max(0.55, w * 0.02)}
                height={Math.max(2.4, h * 0.09)}
                rx={0.25}
              />
              <rect
                x={cx - rx * 0.08}
                y={cy + ry * 0.18}
                width={Math.max(1.8, w * 0.06)}
                height={Math.max(0.45, h * 0.015)}
                rx={0.2}
                opacity={0.85}
              />
              <rect
                x={cx - rx * 0.08 + Math.max(0.65, w * 0.022)}
                y={cy + ry * 0.18 - Math.max(0.65, h * 0.022)}
                width={Math.max(0.45, w * 0.015)}
                height={Math.max(1.8, h * 0.06)}
                rx={0.2}
                opacity={0.85}
              />
            </g>
            <ellipse
              cx={cx + rx * 0.28}
              cy={cy - ry * 0.08}
              rx={rx * 0.09}
              ry={ry * 0.065}
              fill="rgba(255,255,255,0.95)"
            />
            <ellipse
              cx={cx - rx * 0.05}
              cy={cy + ry * 0.22}
              rx={rx * 0.07}
              ry={ry * 0.05}
              fill={withAlpha(hi, 0.9)}
            />
            {isCrystal ? (
              <>
                <ellipse
                  cx={cx + rx * 0.18}
                  cy={cy + ry * 0.32}
                  rx={rx * 0.12}
                  ry={ry * 0.08}
                  fill="rgba(200,235,255,0.7)"
                />
                <line
                  x1={cx - rx * 0.55}
                  y1={cy - ry * 0.2}
                  x2={cx + rx * 0.5}
                  y2={cy + ry * 0.45}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={Math.max(0.5, w * 0.015)}
                />
              </>
            ) : null}
          </g>
        ) : null}

        {/* Primary specular */}
        <ellipse
          cx={cx - rx * 0.28}
          cy={cy - ry * 0.34}
          rx={rx * (0.34 + recipe.specular * 0.22)}
          ry={ry * 0.26}
          fill={`url(#spec-${uid})`}
          opacity={gloss}
        />
        {isGem || bead.category === 'pearl' || isMetal || bead.category === 'pony' ? (
          <ellipse
            cx={cx + rx * 0.22}
            cy={cy + ry * 0.18}
            rx={rx * 0.28}
            ry={ry * 0.22}
            fill={`url(#spec2-${uid})`}
            opacity={isGem ? 0.75 : isMetal ? 0.7 : 0.45}
          />
        ) : null}

        {/* Rim light — skip when metal/charm/letter already drew bevel */}
        {!isMetal && !isLetter && isFaceted && (bead.shape === 'faceted' || bead.category === 'gemstone') ? (
          <polygon
            points={[
              `${cx},${cy - ry}`,
              `${cx + rx * 0.55},${cy - ry * 0.45}`,
              `${cx + rx},${cy}`,
              `${cx + rx * 0.55},${cy + ry * 0.5}`,
              `${cx},${cy + ry}`,
              `${cx - rx * 0.55},${cy + ry * 0.5}`,
              `${cx - rx},${cy}`,
              `${cx - rx * 0.55},${cy - ry * 0.45}`,
            ].join(' ')}
            fill="none"
            stroke={`url(#rim-${uid})`}
            strokeWidth={Math.max(1.3, w * 0.05)}
            opacity={rim}
          />
        ) : !isMetal && !isLetter && isRoundish ? (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={`url(#rim-${uid})`}
            strokeWidth={Math.max(1.2, w * 0.045)}
            opacity={rim}
          />
        ) : !isMetal && !isLetter ? (
          <rect
            x={w * 0.05}
            y={h * 0.07}
            width={w * 0.9}
            height={h * 0.86}
            rx={bodyRadius}
            fill="none"
            stroke={`url(#rim-${uid})`}
            strokeWidth={Math.max(1, w * 0.035)}
            opacity={rim * 0.85}
          />
        ) : null}

        {bead.category === 'pearl' && isRoundish ? (
          <>
            {/* Orient — soft iridescent rings */}
            <ellipse cx={cx} cy={cy} rx={rx * 0.92} ry={ry * 0.92} fill={`url(#orient-${uid})`} opacity={0.9} />
            <ellipse
              cx={cx + rx * 0.08}
              cy={cy + ry * 0.04}
              rx={rx * 0.7}
              ry={ry * 0.62}
              fill="none"
              stroke="rgba(200,180,230,0.35)"
              strokeWidth={Math.max(1.2, w * 0.04)}
            />
            <ellipse
              cx={cx - rx * 0.05}
              cy={cy - ry * 0.02}
              rx={rx * 0.55}
              ry={ry * 0.48}
              fill="none"
              stroke="rgba(180,220,240,0.28)"
              strokeWidth={Math.max(0.9, w * 0.03)}
            />
            <ellipse
              cx={cx + rx * 0.12}
              cy={cy + ry * 0.1}
              rx={rx * 0.58}
              ry={ry * 0.5}
              fill="rgba(255,200,220,0.12)"
            />
            <ellipse
              cx={cx - rx * 0.26}
              cy={cy - ry * 0.32}
              rx={rx * 0.28}
              ry={ry * 0.2}
              fill="rgba(255,255,255,0.85)"
            />
            <ellipse
              cx={cx - rx * 0.18}
              cy={cy - ry * 0.22}
              rx={rx * 0.1}
              ry={ry * 0.07}
              fill="rgba(255,255,255,0.95)"
            />
            <ellipse
              cx={cx + rx * 0.22}
              cy={cy + ry * 0.3}
              rx={rx * 0.2}
              ry={ry * 0.14}
              fill="rgba(255,255,255,0.28)"
            />
          </>
        ) : null}

        {bead.category === 'wood' ? (
          <g>
            {bead.shape === 'tube' ? (
              <>
                <rect
                  x={w * 0.08}
                  y={h * 0.1}
                  width={w * 0.84}
                  height={h * 0.8}
                  rx={bodyRadius}
                  fill={`url(#wood-grain-${uid})`}
                  opacity={0.85}
                />
                {/* Bamboo nodes */}
                {[0.28, 0.5, 0.72].map((t) => (
                  <ellipse
                    key={t}
                    cx={cx}
                    cy={h * t}
                    rx={rx * 0.82}
                    ry={ry * 0.08}
                    fill="none"
                    stroke="rgba(60,30,10,0.35)"
                    strokeWidth={1.2}
                  />
                ))}
                <rect
                  x={w * 0.08}
                  y={h * 0.1}
                  width={w * 0.84}
                  height={h * 0.8}
                  rx={bodyRadius}
                  fill={`url(#wood-varnish-${uid})`}
                  opacity={0.7}
                />
              </>
            ) : (
              <>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.95}
                  ry={ry * 0.95}
                  fill={`url(#wood-grain-${uid})`}
                  opacity={0.9}
                />
                {/* Growth rings */}
                <ellipse
                  cx={cx - rx * 0.08}
                  cy={cy + ry * 0.05}
                  rx={rx * 0.55}
                  ry={ry * 0.42}
                  fill="none"
                  stroke="rgba(60,30,10,0.28)"
                  strokeWidth={1.1}
                />
                <ellipse
                  cx={cx - rx * 0.08}
                  cy={cy + ry * 0.05}
                  rx={rx * 0.35}
                  ry={ry * 0.26}
                  fill="none"
                  stroke="rgba(60,30,10,0.22)"
                  strokeWidth={0.9}
                />
                <ellipse
                  cx={cx - rx * 0.05}
                  cy={cy + ry * 0.02}
                  rx={rx * 0.16}
                  ry={ry * 0.12}
                  fill="rgba(40,20,8,0.2)"
                />
                <path
                  d={`M ${cx - rx * 0.55} ${cy - ry * 0.2} Q ${cx} ${cy - ry * 0.05} ${cx + rx * 0.55} ${cy - ry * 0.15}`}
                  fill="none"
                  stroke="rgba(60,30,10,0.25)"
                  strokeWidth={1}
                />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill={`url(#wood-varnish-${uid})`}
                  opacity={0.85}
                />
                <ellipse
                  cx={cx - rx * 0.28}
                  cy={cy - ry * 0.32}
                  rx={rx * 0.2}
                  ry={ry * 0.12}
                  fill="rgba(255,255,255,0.35)"
                />
              </>
            )}
          </g>
        ) : null}

        {bead.category === 'pony' ? (
          <g>
            {isRoundish ? (
              <>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.95}
                  ry={ry * 0.95}
                  fill={`url(#pony-band-${uid})`}
                  opacity={0.85}
                />
                {/* Equator candy stripe hint */}
                <ellipse
                  cx={cx}
                  cy={cy + ry * 0.05}
                  rx={rx * 0.92}
                  ry={ry * 0.22}
                  fill="rgba(255,255,255,0.12)"
                />
                <ellipse
                  cx={cx - rx * 0.28}
                  cy={cy - ry * 0.34}
                  rx={rx * 0.28}
                  ry={ry * 0.18}
                  fill="rgba(255,255,255,0.7)"
                />
                <ellipse
                  cx={cx - rx * 0.18}
                  cy={cy - ry * 0.28}
                  rx={rx * 0.1}
                  ry={ry * 0.07}
                  fill="rgba(255,255,255,0.95)"
                />
                <ellipse
                  cx={cx + rx * 0.32}
                  cy={cy + ry * 0.28}
                  rx={rx * 0.2}
                  ry={ry * 0.14}
                  fill="rgba(255,255,255,0.2)"
                />
                {/* Soft rim */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={Math.max(1.1, w * 0.04)}
                  opacity={0.8}
                />
              </>
            ) : (
              <>
                <rect
                  x={w * 0.08}
                  y={h * 0.1}
                  width={w * 0.84}
                  height={h * 0.8}
                  rx={bodyRadius}
                  fill={`url(#pony-band-${uid})`}
                  opacity={0.75}
                />
                <ellipse
                  cx={cx - rx * 0.15}
                  cy={cy - ry * 0.25}
                  rx={rx * 0.25}
                  ry={ry * 0.15}
                  fill="rgba(255,255,255,0.55)"
                />
              </>
            )}
          </g>
        ) : null}

        {/* Bail ring on charms (tray / when not hanging below cord) */}
        {isCharm ? (
          <g>
            <circle
              cx={cx}
              cy={h * 0.1}
              r={Math.max(2.2, w * 0.1)}
              fill="none"
              stroke={`url(#metal-body-${uid})`}
              strokeWidth={Math.max(1.6, w * 0.055)}
            />
            <circle
              cx={cx}
              cy={h * 0.1}
              r={Math.max(2.2, w * 0.1)}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={Math.max(0.6, w * 0.02)}
            />
          </g>
        ) : null}

        {paintHole ? (
          <>
            <ellipse cx={cx} cy={cy} rx={holeRx} ry={holeRy} fill={cordColor} opacity={0.9} />
            <ellipse
              cx={cx}
              cy={cy}
              rx={holeRx}
              ry={holeRy}
              fill="none"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={Math.max(0.7, w * 0.025)}
            />
          </>
        ) : null}
      </g>

      {showLetterHere ? (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={letterGlyphColor(bead)}
          fontSize={letterSize}
          fontWeight={800}
          fontFamily="Alef, Heebo, Rubik, sans-serif"
          style={{ paintOrder: 'stroke fill' }}
          stroke={bead.color.toLowerCase() === '#1a1a1a' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.55)'}
          strokeWidth={Math.max(0.6, w * 0.025)}
        >
          {bead.letter}
        </text>
      ) : null}
    </svg>
  );
}
