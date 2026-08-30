import type { CSSProperties } from 'react';
import type { DragGhost } from '../lib/useThreadDrag';
import { BeadVisual } from './BeadVisual';

/** חרוז מרחף בזמן גרירה — lift + shadow + snap glow */
export function BeadDragGhost({ ghost }: { ghost: DragGhost }) {
  const liftRotate = ghost.snapping ? 3 : 5;
  const style: CSSProperties = {
    position: 'fixed',
    left: ghost.x,
    top: ghost.y,
    transform: `translate(-50%, -60%) scale(1.15) rotate(${liftRotate + ghost.rotation * 0.35}deg)`,
    zIndex: 1000,
    pointerEvents: 'none',
    filter: ghost.snapping
      ? 'drop-shadow(0 15px 10px rgba(0,0,0,0.2)) drop-shadow(0 0 12px color-mix(in srgb, var(--accent) 55%, transparent))'
      : 'drop-shadow(0 15px 10px rgba(0,0,0,0.22))',
    transition: 'filter 0.12s ease, transform 0.12s ease',
  };

  return (
    <div className={`bead-drag-ghost bead-drag-ghost--lifted${ghost.snapping ? ' is-snapping' : ''}`} style={style} aria-hidden>
      <BeadVisual bead={ghost.bead} />
    </div>
  );
}
