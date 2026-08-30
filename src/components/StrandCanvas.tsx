import { useId, useMemo } from 'react';
import { getBead } from '../data/beads';
import { beadPixelSize } from '../lib/materials';
import type { PlacedBead, ProductKind } from '../lib/types';
import { BeadSvg, letterGlyphColor } from './BeadSvg';
import { namespaceSvgMarkup } from '../lib/themeBeads';

type Props = {
  kind: ProductKind;
  beads: PlacedBead[];
  cordColor: string;
  onRemoveAt?: (index: number) => void;
  emptyLabel?: string;
  compact?: boolean;
  /** תצוגת סיום — צמיד/שרשרת סגורים */
  closed?: boolean;
};

function isMetallicCord(color: string) {
  const c = color.toLowerCase();
  return c === '#c9a227' || c === '#a8a8b0' || c === '#b76e79';
}

type MetalTone = 'gold' | 'silver' | 'rose';

function metalTone(color: string): MetalTone {
  const c = color.toLowerCase();
  if (c === '#a8a8b0') return 'silver';
  if (c === '#b76e79') return 'rose';
  return 'gold';
}

type ChainLink = { x: number; y: number; angle: number; alt: boolean };

function sampleQuadChain(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  count: number,
): ChainLink[] {
  const links: ChainLink[] = [];
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 0.5 : i / (count - 1);
    const pt = quadAt(x0, y0, cx, cy, x1, y1, t);
    links.push({ x: pt.x, y: pt.y, angle: pt.angle, alt: i % 2 === 1 });
  }
  return links;
}

function sampleEllipseChain(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  startAngle = -Math.PI / 2,
): ChainLink[] {
  const links: ChainLink[] = [];
  for (let i = 0; i < count; i++) {
    const a = startAngle + (i / count) * Math.PI * 2;
    const pt = ellipsePoint(cx, cy, rx, ry, a);
    links.push({ x: pt.x, y: pt.y, angle: pt.angle, alt: i % 2 === 1 });
  }
  return links;
}

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angleRad: number) {
  const x = cx + rx * Math.cos(angleRad);
  const y = cy + ry * Math.sin(angleRad);
  const tx = -rx * Math.sin(angleRad);
  const ty = ry * Math.cos(angleRad);
  return { x, y, angle: (Math.atan2(ty, tx) * 180) / Math.PI };
}

type LaidBead = {
  placed: PlacedBead;
  index: number;
  bead: NonNullable<ReturnType<typeof getBead>>;
  x: number;
  y: number;
  angle: number;
  w: number;
  h: number;
  holeRx: number;
  holeRy: number;
  /** נקודת עיגון על החוט לתליון */
  hangFromY?: number;
};

function buildCordPath(x0: number, y0: number, x1: number, y1: number, sag: number) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + sag;
  return { d: `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`, cx, cy };
}

function quadAt(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  t: number,
) {
  const omt = 1 - t;
  const x = omt * omt * x0 + 2 * omt * t * cx + t * t * x1;
  const y = omt * omt * y0 + 2 * omt * t * cy + t * t * y1;
  const dx = 2 * omt * (cx - x0) + 2 * t * (x1 - cx);
  const dy = 2 * omt * (cy - y0) + 2 * t * (y1 - cy);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

/**
 * SVG strand: bead-board groove + continuous cord sandwich through holes.
 */
export function StrandCanvas({
  kind,
  beads,
  cordColor,
  onRemoveAt,
  emptyLabel = 'גררו חרוז מהמגש אל החוט — או הקישו להשחיל',
  compact = false,
  closed = false,
}: Props) {
  const uid = useId().replace(/:/g, '');
  const metallic = isMetallicCord(cordColor);

  const layout = useMemo(() => {
    const padX = compact ? 34 : 52;
    const vbW = compact ? 400 : 680;
    const vbH =
      kind === 'necklace'
        ? compact
          ? closed
            ? 200
            : 168
          : closed
            ? 260
            : 220
        : kind === 'ornament'
          ? compact
            ? 156
            : 198
          : compact
            ? closed
              ? 190
              : 142
            : closed
              ? 240
              : 178;

    const scale = compact ? 0.9 : 1.05;
    const resolved = beads
      .map((placed, index) => {
        const bead = getBead(placed.beadId);
        if (!bead) return null;
        const { w, h } = beadPixelSize(bead.size, bead.shape);
        return { placed, index, bead, w: w * scale, h: h * scale };
      })
      .filter(Boolean) as Array<{
      placed: PlacedBead;
      index: number;
      bead: NonNullable<ReturnType<typeof getBead>>;
      w: number;
      h: number;
    }>;

    const gap = 7;

    // —— Closed jewelry: oval / U loop ——
    if (closed && kind !== 'ornament') {
      const cx = vbW / 2;
      const cy = vbH * (kind === 'necklace' ? 0.42 : 0.5);
      const rx = vbW * (kind === 'necklace' ? 0.3 : 0.28);
      const ry = vbH * (kind === 'necklace' ? 0.34 : 0.3);
      const d = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`;
      const n = Math.max(1, resolved.length);
      const laid: LaidBead[] = resolved.map((item, i) => {
        // start from bottom-ish for bracelet; necklace hangs with clasp at top (-PI/2)
        const start = kind === 'necklace' ? -Math.PI / 2 : Math.PI / 2;
        const angleRad = start + (i / n) * Math.PI * 2;
        const pt = ellipsePoint(cx, cy, rx, ry, angleRad);
        const isCharm = item.bead.category === 'charm';
        const hang = isCharm ? item.h * 0.5 + 10 : 0;
        const outward = Math.atan2(pt.y - cy, pt.x - cx);
        return {
          ...item,
          x: pt.x + (isCharm ? Math.cos(outward) * hang * 0.15 : 0),
          y: pt.y + hang,
          angle: isCharm ? 0 : pt.angle,
          holeRx: Math.max(2, item.w * 0.08),
          holeRy: Math.max(2, item.h * 0.08),
          hangFromY: isCharm ? pt.y : undefined,
        };
      });
      const linkCount = compact ? 28 : 42;
      const chainLinks = metallic
        ? sampleEllipseChain(cx, cy, rx, ry, linkCount, kind === 'necklace' ? -Math.PI / 2 : Math.PI / 2)
        : [];
      return {
        vbW,
        vbH,
        midY: cy,
        x0: cx,
        x1: cx,
        path: { d, cx, cy },
        laid,
        cordW: compact ? 3.6 : metallic ? 5.2 : 4.8,
        closed: true as const,
        claspX: cx,
        claspY: cy - ry,
        metallic,
        rx,
        ry,
        chainLinks,
      };
    }

    const midY = vbH * (kind === 'necklace' ? 0.38 : 0.46);
    const sag = kind === 'necklace' ? vbH * 0.3 : kind === 'ornament' ? vbH * 0.18 : vbH * 0.09;
    const x0 = padX;
    const x1 = vbW - padX;
    const path = buildCordPath(x0, midY, x1, midY, sag);

    const totalW = resolved.reduce((s, z) => s + z.w + gap, 0);
    const usable = x1 - x0;
    const startT = totalW >= usable * 0.9 ? 0.06 : Math.max(0.1, (1 - totalW / usable) / 2);
    const endT = 1 - startT;
    const span = Math.max(0.01, endT - startT);

    let cursor = 0;
    const laid: LaidBead[] = resolved.map((item) => {
      const halfFrac = totalW > 0 ? (item.w / 2 + cursor) / totalW : 0.5;
      const t = startT + halfFrac * span;
      const pt = quadAt(x0, midY, path.cx, path.cy, x1, midY, t);
      const holeRx = Math.max(2, item.w * 0.08);
      const holeRy = Math.max(2, item.h * 0.08);
      const isCharm = item.bead.category === 'charm';
      const hang = isCharm ? item.h * 0.55 + (compact ? 8 : 12) : 0;
      cursor += item.w + gap;
      return {
        ...item,
        x: pt.x,
        y: pt.y + hang,
        angle: isCharm ? 0 : pt.angle,
        holeRx,
        holeRy,
        hangFromY: isCharm ? pt.y : undefined,
      };
    });

    return {
      vbW,
      vbH,
      midY,
      x0,
      x1,
      path,
      laid,
      cordW: compact ? 3.6 : metallic ? 5.2 : 4.8,
      closed: false as const,
      claspX: x0,
      claspY: midY,
      metallic,
      rx: 0,
      ry: 0,
      chainLinks: metallic
        ? sampleQuadChain(x0, midY, path.cx, path.cy, x1, midY, compact ? 22 : 36)
        : ([] as ChainLink[]),
    };
  }, [beads, kind, compact, closed, metallic]);

  const {
    vbW,
    vbH,
    midY,
    x0,
    x1,
    path,
    laid,
    cordW,
    closed: isClosed,
    claspX,
    claspY,
    metallic: metalCord,
    chainLinks,
  } = layout;
  const tone = metalTone(cordColor);
  const cordGrad = `cord-g-${uid}`;
  const boardGrad = `board-g-${uid}`;
  const grooveGrad = `groove-g-${uid}`;
  const cordSoft = `cord-soft-${uid}`;
  const metalGrad = `metal-g-${uid}`;
  const chainGrad = `chain-g-${uid}`;
  const chainHi = `chain-hi-${uid}`;
  const chainLo = `chain-lo-${uid}`;

  return (
    <div
      className={`strand-svg-host kind-${kind}${compact ? ' strand-svg-host--compact' : ''}${isClosed ? ' is-closed' : ''}${metalCord ? ' is-chain' : ''}`}
    >
      <svg
        className="strand-canvas"
        viewBox={`0 0 ${vbW} ${vbH}`}
        role="img"
        aria-label="תצוגת חוט וחרוזים"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={boardGrad} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3ebe0" />
            <stop offset="55%" stopColor="#e8dfd2" />
            <stop offset="100%" stopColor="#d9cdb8" />
          </linearGradient>
          <linearGradient id={grooveGrad} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c9b8a2" />
            <stop offset="45%" stopColor="#bba892" />
            <stop offset="100%" stopColor="#d4c4b0" />
          </linearGradient>
          <linearGradient id={cordGrad} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff8ee" stopOpacity={0.7} />
            <stop offset="38%" stopColor={cordColor} />
            <stop offset="100%" stopColor="#4a3420" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id={metalGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tone === 'silver' ? '#f4f4f6' : tone === 'rose' ? '#f5d0d4' : '#fff3c8'} />
            <stop offset="45%" stopColor={cordColor} />
            <stop offset="100%" stopColor={tone === 'silver' ? '#6a6a72' : tone === 'rose' ? '#7a3a45' : '#6a5018'} />
          </linearGradient>
          <linearGradient id={chainGrad} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={tone === 'silver' ? '#ffffff' : tone === 'rose' ? '#ffe8ea' : '#fff8d6'} />
            <stop offset="40%" stopColor={cordColor} />
            <stop offset="100%" stopColor={tone === 'silver' ? '#5c5c66' : tone === 'rose' ? '#6e3040' : '#5a4210'} />
          </linearGradient>
          <radialGradient id={chainHi} cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id={chainLo} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
          </linearGradient>
          <filter id={cordSoft} x="-12%" y="-50%" width="124%" height="200%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="1.1" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Felt / wood bead board */}
        <rect width={vbW} height={vbH} fill={`url(#${boardGrad})`} rx={14} />
        {/* Concave groove (מגש חריזה) */}
        <ellipse
          cx={vbW / 2}
          cy={midY + (kind === 'necklace' ? vbH * 0.08 : 2)}
          rx={(vbW - padSafe(padX(compact))) / 2}
          ry={kind === 'necklace' ? vbH * 0.28 : vbH * 0.2}
          fill={`url(#${grooveGrad})`}
          opacity={0.85}
        />
        <ellipse
          cx={vbW / 2}
          cy={midY + (kind === 'necklace' ? vbH * 0.08 : 2)}
          rx={(vbW - padSafe(padX(compact))) / 2 - 6}
          ry={kind === 'necklace' ? vbH * 0.2 : vbH * 0.12}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={2}
        />

        {/* Layer 1 — cord or gold-chain links */}
        {metalCord ? (
          <>
            {/* Soft under-glow so gaps between links still read as jewelry */}
            <path
              d={path.d}
              fill="none"
              stroke={cordColor}
              strokeWidth={Math.max(2.2, cordW * 0.45)}
              strokeLinecap="round"
              opacity={0.35}
              filter={`url(#${cordSoft})`}
            />
            <GoldChainLinks
              links={chainLinks}
              fillId={chainGrad}
              hiId={chainHi}
              loId={chainLo}
              compact={compact}
            />
          </>
        ) : (
          <>
            <path
              d={path.d}
              fill="none"
              stroke={`url(#${cordGrad})`}
              strokeWidth={cordW}
              strokeLinecap="round"
              filter={`url(#${cordSoft})`}
            />
            <path
              d={path.d}
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth={Math.max(1, cordW * 0.3)}
              strokeLinecap="round"
              transform={`translate(0 ${-cordW * 0.18})`}
            />
          </>
        )}

        {isClosed ? (
          <g transform={`translate(${claspX}, ${claspY})`}>
            <circle r={7} fill={`url(#${metalGrad})`} stroke="rgba(80,55,20,0.4)" strokeWidth={1} />
            <circle r={3} fill="rgba(40,28,16,0.25)" />
            <path
              d="M -5 -1 H 5 M -3 2 H 3"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </g>
        ) : (
          <>
            <ClaspLobster x={x0} y={midY} metalId={metalGrad} side="left" />
            <ClaspStopper x={x1} y={midY} metalId={metalGrad} cordColor={cordColor} side="right" />
          </>
        )}

        {kind === 'ornament' && !isClosed ? (
          <circle
            cx={vbW / 2}
            cy={16}
            r={9}
            fill="none"
            stroke={`url(#${metalGrad})`}
            strokeWidth={3}
          />
        ) : null}

        {laid.map((b) => {
          const removable = Boolean(onRemoveAt);
          // Letter cubes stay more face-on; organic beads follow cord tangent lightly
          const drawAngle = b.bead.letter ? b.angle * 0.15 : b.angle;

          return (
            <g
              key={b.placed.instanceId}
              className={`strand-bead-group${b.index === laid.length - 1 ? ' is-fresh' : ''}`}
            >
              {/* Jump ring + hang for charms */}
              {b.hangFromY != null ? (
                <g className="charm-hang" aria-hidden>
                  <line
                    x1={b.x}
                    y1={b.hangFromY}
                    x2={b.x}
                    y2={b.y - b.h * 0.42}
                    stroke={`url(#${metalGrad})`}
                    strokeWidth={1.85}
                    strokeLinecap="round"
                  />
                  {/* Jump ring — thicker oval with highlight */}
                  <ellipse
                    cx={b.x}
                    cy={b.hangFromY}
                    rx={4.2}
                    ry={3.6}
                    fill="none"
                    stroke={`url(#${metalGrad})`}
                    strokeWidth={2.2}
                  />
                  <ellipse
                    cx={b.x - 0.6}
                    cy={b.hangFromY - 0.8}
                    rx={4.2}
                    ry={3.6}
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth={0.9}
                    strokeDasharray="4 10"
                  />
                </g>
              ) : null}

              {/* Contact shadow on board */}
              <ellipse
                cx={b.x + 1}
                cy={b.y + b.h * 0.42}
                rx={b.w * 0.42}
                ry={b.h * 0.14}
                fill="rgba(40,28,16,0.22)"
              />

              {/* Solid 3D bead over the cord — no visible drill hole */}
              <g transform={`translate(${b.x}, ${b.y}) rotate(${drawAngle})`}>
                <g transform={`translate(${-b.w / 2}, ${-b.h / 2})`}>
                  {b.bead.svgMarkup ? (
                    <foreignObject width={b.w} height={b.h} className="strand-theme-charm">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: namespaceSvgMarkup(
                            b.bead.svgMarkup,
                            b.placed.instanceId.replace(/[^a-zA-Z0-9]/g, ''),
                          ),
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      />
                    </foreignObject>
                  ) : (
                    <BeadSvg
                      bead={b.bead}
                      instanceKey={b.placed.instanceId}
                      widthPx={b.w}
                      heightPx={b.h}
                      solid
                      deferLetter={Boolean(b.bead.letter)}
                      cordColor={cordColor}
                    />
                  )}
                </g>
              </g>

              {/* Upright letter/digit on the solid face */}
              {b.bead.letter ? (
                <text
                  x={b.x}
                  y={b.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={letterGlyphColor(b.bead)}
                  fontSize={Math.max(12, Math.min(b.w, b.h) * 0.5)}
                  fontWeight={800}
                  fontFamily="Alef, Heebo, Rubik, sans-serif"
                  stroke={
                    b.bead.color.toLowerCase() === '#1a1a1a'
                      ? 'rgba(0,0,0,0.45)'
                      : 'rgba(255,255,255,0.75)'
                  }
                  strokeWidth={1.35}
                  style={{ paintOrder: 'stroke fill', pointerEvents: 'none' }}
                >
                  {b.bead.letter}
                </text>
              ) : null}

              <circle
                cx={b.x}
                cy={b.y}
                r={Math.max(b.w, b.h) * 0.55}
                fill="transparent"
                role={removable ? 'button' : undefined}
                tabIndex={removable ? 0 : undefined}
                aria-label={
                  removable
                    ? `${b.bead.nameHe}${b.bead.letter ? ` ${b.bead.letter}` : ''} — לחצו להסרה`
                    : b.bead.nameHe
                }
                onClick={removable ? () => onRemoveAt?.(b.index) : undefined}
                onKeyDown={
                  removable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRemoveAt?.(b.index);
                        }
                      }
                    : undefined
                }
                style={removable ? { cursor: 'pointer' } : undefined}
              />
            </g>
          );
        })}

        {laid.length === 0 ? (
          <text
            x={vbW / 2}
            y={vbH * 0.58}
            textAnchor="middle"
            fill="rgba(43,40,38,0.5)"
            fontSize={compact ? 13 : 16}
            fontFamily="Alef, Frank Ruhl Libre, sans-serif"
          >
            {emptyLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

function padX(compact: boolean) {
  return compact ? 34 : 52;
}

function padSafe(n: number) {
  return n * 2 + 8;
}

/** קישורי שרשרת מתכת — אליפסות מתחלפות לאורך המסלול */
function GoldChainLinks({
  links,
  fillId,
  hiId,
  loId,
  compact,
}: {
  links: ChainLink[];
  fillId: string;
  hiId: string;
  loId: string;
  compact: boolean;
}) {
  const rx = compact ? 4.2 : 5.4;
  const ry = compact ? 2.55 : 3.25;
  const stroke = compact ? 1.35 : 1.65;

  return (
    <g className="gold-chain-links" aria-hidden>
      {links.map((link, i) => {
        // קישור זוגי שטוח עם המסלול; אי-זוגי מעט מאונך — מראה שזירה
        const twist = link.alt ? 70 : 0;
        const scaleY = link.alt ? 0.92 : 1;
        return (
          <g
            key={`lnk-${i}`}
            transform={`translate(${link.x}, ${link.y}) rotate(${link.angle + twist}) scale(1, ${scaleY})`}
          >
            <ellipse
              cx={0}
              cy={0}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={`url(#${fillId})`}
              strokeWidth={stroke}
            />
            <ellipse
              cx={0}
              cy={0}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={`url(#${loId})`}
              strokeWidth={stroke * 0.85}
              opacity={0.85}
            />
            <ellipse
              cx={-rx * 0.22}
              cy={-ry * 0.35}
              rx={rx * 0.45}
              ry={ry * 0.35}
              fill={`url(#${hiId})`}
              opacity={0.55}
            />
          </g>
        );
      })}
    </g>
  );
}

/** Lobster-style clasp (סוגר תוכי מפושט) */
function ClaspLobster({
  x,
  y,
  metalId,
  side,
}: {
  x: number;
  y: number;
  metalId: string;
  side: 'left' | 'right';
}) {
  const flip = side === 'left' ? -1 : 1;
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      <path
        d="M 0 -2 C 6 -10 16 -10 18 -2 C 20 4 14 10 6 8 C 2 7 1 4 0 2 Z"
        fill={`url(#${metalId})`}
        stroke="rgba(80,55,20,0.45)"
        strokeWidth={0.9}
        transform="translate(-20, 0)"
      />
      <circle cx={-4} cy={0} r={2.4} fill={`url(#${metalId})`} stroke="rgba(80,55,20,0.4)" strokeWidth={0.7} />
      <circle cx={-4} cy={0} r={1} fill="rgba(40,28,16,0.35)" />
    </g>
  );
}

/** End stopper / barrel clasp */
function ClaspStopper({
  x,
  y,
  metalId,
  cordColor,
  side,
}: {
  x: number;
  y: number;
  metalId: string;
  cordColor: string;
  side: 'left' | 'right';
}) {
  const dir = side === 'right' ? 1 : -1;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={dir > 0 ? 2 : -14}
        y={-8}
        width={12}
        height={16}
        rx={4}
        fill={`url(#${metalId})`}
        stroke="rgba(80,55,20,0.4)"
        strokeWidth={0.9}
      />
      <rect
        x={dir > 0 ? 4 : -12}
        y={-5}
        width={8}
        height={10}
        rx={2}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={0.8}
      />
      <circle cx={0} cy={0} r={2.2} fill={cordColor} stroke="rgba(0,0,0,0.25)" strokeWidth={0.6} />
    </g>
  );
}
