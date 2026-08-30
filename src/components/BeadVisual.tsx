import type { CSSProperties, PointerEventHandler } from 'react';
import { getBead } from '../data/beads';
import type { BeadDef, PlacedBead } from '../lib/types';
import { BeadSvg } from './BeadSvg';
import { CharmSvgMarkup } from './CharmSvgMarkup';

const SIZE_PX: Record<BeadDef['size'], number> = {
  xs: 16,
  sm: 22,
  md: 32,
  lg: 40,
};

/** חומרים שמרוויחים מרינדור SVG עשיר גם במגש */
function prefersSvgBead(bead: BeadDef): boolean {
  if (bead.svgMarkup) return true;
  return (
    bead.category === 'gemstone' ||
    bead.category === 'crystal' ||
    bead.category === 'pearl' ||
    bead.category === 'metal' ||
    bead.category === 'charm' ||
    bead.category === 'pony' ||
    bead.category === 'wood' ||
    bead.category === 'letter'
  );
}

/** חרוז ריאליסטי: SVG לאבנים/קריסטל/פנינה/מתכת, CSS לשאר */
export function BeadVisual({
  bead,
  selected,
  onClick,
  onPointerDown,
  title,
  cordColor,
  threaded = false,
}: {
  bead: BeadDef;
  selected?: boolean;
  onClick?: () => void;
  onPointerDown?: PointerEventHandler<HTMLButtonElement>;
  title?: string;
  cordColor?: string;
  threaded?: boolean;
}) {
  const px = SIZE_PX[bead.size];
  const trayBoost =
    bead.category === 'charm' || bead.svgMarkup ? 1.4 : bead.category === 'letter' ? 1.22 : 1.28;
  const scale = prefersSvgBead(bead) && !threaded ? trayBoost : 1;
  const baseW = bead.shape === 'tube' ? px * 0.58 : bead.shape === 'disc' ? px * 1.05 : px;
  const baseH = bead.shape === 'disc' ? px * 0.42 : bead.shape === 'tube' ? px * 1.15 : px;
  const minPx = bead.category === 'charm' || bead.svgMarkup ? 48 : prefersSvgBead(bead) ? 38 : 0;
  const w = Math.max(baseW * scale, minPx);
  const h = Math.max(baseH * scale, minPx);
  const holeW = Math.max(10, Math.round(px * (bead.shape === 'disc' ? 0.32 : 0.38)));
  const holeH = Math.max(7, Math.round(px * (bead.shape === 'disc' ? 0.62 : 0.26)));
  const letterColor = resolveLetterColor(bead);
  const svgMode = prefersSvgBead(bead);
  const vectorCharm = Boolean(bead.svgMarkup);

  return (
    <button
      type="button"
      className={[
        'bead-visual',
        `cat-${bead.category}`,
        `shape-${bead.shape}`,
        selected ? 'is-selected' : '',
        threaded ? 'is-threaded' : '',
        svgMode ? 'is-svg-bead' : '',
        vectorCharm ? 'is-theme-charm' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onPointerDown={onPointerDown}
      title={title ?? bead.nameHe}
      aria-label={bead.nameHe}
      style={
        {
          width: w,
          height: h,
          '--bead-color': bead.color,
          '--bead-hi': bead.highlight ?? '#ffffff',
          '--cord-through': cordColor ?? '#c4a574',
          '--hole-w': `${holeW}px`,
          '--hole-h': `${holeH}px`,
          touchAction: onPointerDown ? 'none' : undefined,
        } as CSSProperties
      }
    >
      {vectorCharm && bead.svgMarkup ? (
        <CharmSvgMarkup markup={bead.svgMarkup} size={Math.max(w, h)} />
      ) : svgMode ? (
        <BeadSvg
          bead={bead}
          widthPx={w}
          heightPx={h}
          solid
          showHole={false}
          cordColor={cordColor}
        />
      ) : (
        <>
          <span className="bead-shell" style={shapeCss(bead)} aria-hidden>
            <span className="bead-fill" />
            <span className="bead-gloss" />
            <span className="bead-rim" />
            <span className="bead-hole">
              <span className="bead-hole-inner" />
            </span>
            {bead.shape === 'heart' ? <span className="bead-charm bead-charm-heart" /> : null}
            {bead.shape === 'star' ? <span className="bead-charm bead-charm-star" /> : null}
          </span>
          {bead.letter ? (
            <span className="bead-letter" style={{ color: letterColor }}>
              {bead.letter}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

export function PlacedBeadVisual({
  placed,
  onRemove,
  cordColor,
}: {
  placed: PlacedBead;
  onRemove?: () => void;
  cordColor?: string;
}) {
  const bead = getBead(placed.beadId);
  if (!bead) return null;
  return (
    <BeadVisual
      bead={bead}
      onClick={onRemove}
      title={`${bead.nameHe} — לחצו להסרה`}
      cordColor={cordColor}
      threaded
    />
  );
}

function resolveLetterColor(bead: BeadDef): string | undefined {
  if (bead.category !== 'letter') return undefined;
  if (bead.color === '#1A1A1A') return '#F5F0E8';
  if (bead.color === '#C9A227') return '#4A3208';
  return '#1c1916';
}

function shapeCss(bead: BeadDef): CSSProperties {
  switch (bead.shape) {
    case 'cube':
      return { borderRadius: 5 };
    case 'disc':
      return { borderRadius: 999 };
    case 'faceted':
      return { borderRadius: 7 };
    case 'star':
    case 'heart':
    case 'leaf':
    case 'shell':
    case 'flower':
      return { borderRadius: '50%' };
    case 'tube':
      return { borderRadius: 5 };
    case 'oval':
      return { borderRadius: '50% / 42%' };
    default:
      return { borderRadius: '50%' };
  }
}
