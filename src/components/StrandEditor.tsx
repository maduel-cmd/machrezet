import { useCallback, useState } from 'react';
import { CORD_COLORS, PRODUCT_LABELS } from '../data/beads';
import { playBeadClack, playClearWhoosh, playCelebrateFanfare, playCordTap, playUndoClack } from '../lib/craftSounds';
import type { BeadDef, PlacedBead, ProductKind } from '../lib/types';
import { useThreadDrag } from '../lib/useThreadDrag';
import { BeadDragGhost } from './BeadDragGhost';
import { BeadPalette } from './BeadPalette';
import { CelebrationBurst } from './CelebrationBurst';
import { StrandPreview } from './StrandPreview';

export function StrandEditor({
  kind,
  onKindChange,
  cordColor,
  onCordChange,
  beads,
  onAdd,
  onRemoveAt,
  onClear,
  onUndo,
  maxBeads = 36,
  lockedKind,
  closed = false,
  onClosedChange,
  /** הסתרת כפתור סגירה נפרד — כשהשמירה החיצונית קושרת+שומרת */
  hideCloseButton = false,
}: {
  kind: ProductKind;
  onKindChange: (k: ProductKind) => void;
  cordColor: string;
  onCordChange: (c: string) => void;
  beads: PlacedBead[];
  onAdd: (bead: BeadDef) => void;
  onRemoveAt: (index: number) => void;
  onClear: () => void;
  onUndo: () => void;
  maxBeads?: number;
  lockedKind?: boolean;
  closed?: boolean;
  onClosedChange?: (closed: boolean) => void;
  hideCloseButton?: boolean;
}) {
  const atMax = beads.length >= maxBeads;
  const [celebrating, setCelebrating] = useState(false);

  const onThread = useCallback(
    (bead: BeadDef) => {
      if (atMax || closed) return;
      playBeadClack();
      onAdd(bead);
    },
    [atMax, closed, onAdd],
  );

  const { ghost, beginDrag, stageRef, isDragging } = useThreadDrag({
    onThread,
    disabled: atMax || closed,
  });

  const finishClose = () => {
    if (beads.length === 0 || kind === 'ornament') return;
    playCelebrateFanfare();
    onClosedChange?.(true);
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 2200);
  };

  const handleUndo = () => {
    if (beads.length === 0) return;
    playUndoClack();
    onUndo();
  };

  const handleClear = () => {
    if (beads.length === 0) return;
    playClearWhoosh();
    onClear();
  };

  const handleRemoveAt = (index: number) => {
    playUndoClack();
    onRemoveAt(index);
  };

  return (
    <div
      className={`strand-editor craft-editor${isDragging ? ' is-dragging' : ''}${closed ? ' is-finished' : ''}${celebrating ? ' is-celebrating' : ''}`}
    >
      <div
        className="jewelry-stage"
        aria-label={closed ? 'התכשיט המושלם' : 'שולחן היצירה — גררו חרוז לכאן'}
        ref={(node) => {
          stageRef.current = node;
        }}
      >
        <div className="snap-affordance" aria-hidden />
        {celebrating ? <div className="jewel-sparkle" aria-hidden /> : null}
        <CelebrationBurst active={celebrating} />
        <StrandPreview
          beads={beads}
          cordColor={cordColor}
          kind={kind}
          onRemoveAt={handleRemoveAt}
          closed={closed}
        />
      </div>

      <div className="editor-action-row">
        {!closed ? (
          <>
            <button
              type="button"
              className="icon-action"
              onClick={handleUndo}
              disabled={beads.length === 0}
              aria-label="חרוז אחורה"
            >
              חרוז אחורה ↩️
            </button>
            <button
              type="button"
              className="icon-action"
              onClick={handleClear}
              disabled={beads.length === 0}
              aria-label="מחדש"
            >
              מחדש 🗑️
            </button>
          </>
        ) : (
          <button type="button" className="icon-action" onClick={() => onClosedChange?.(false)} aria-label="פתיחה לעריכה">
            ✎ עריכה
          </button>
        )}
        <span className="bead-count" aria-live="polite">
          {beads.length}/{maxBeads}
        </span>
      </div>

      {!closed ? (
        <div className="editor-meta">
          <div className="meta-group kind-seg" role="group" aria-label="סוג תכשיט">
            {(['bracelet', 'necklace', 'ornament'] as ProductKind[]).map((k) => (
              <button
                key={k}
                type="button"
                disabled={lockedKind}
                className={kind === k ? 'is-active' : ''}
                onClick={() => onKindChange(k)}
              >
                {PRODUCT_LABELS[k]}
              </button>
            ))}
          </div>
          <div className="meta-group cord-row" role="group" aria-label="צבע חוט">
            {CORD_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cord-swatch ${cordColor === c.color ? 'is-active' : ''}`}
                style={{ background: c.color }}
                title={c.nameHe}
                aria-label={c.nameHe}
                onClick={() => {
                  playCordTap();
                  onCordChange(c.color);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {!closed ? (
        <BeadPalette onPick={onThread} onDragStart={beginDrag} />
      ) : (
        <p className="finish-note">מעולה! התכשיט מוכן — לחצו למטה כדי לשמור לתיבה.</p>
      )}

      {!hideCloseButton && !closed && beads.length > 0 && kind !== 'ornament' && onClosedChange ? (
        <button type="button" className="close-jewel-btn" onClick={finishClose}>
          {kind === 'necklace' ? 'סיימתי! לקשור את השרשרת 🪢' : 'סיימתי! לקשור את הצמיד 🪢'}
        </button>
      ) : null}

      {ghost ? <BeadDragGhost ghost={ghost} /> : null}
    </div>
  );
}
