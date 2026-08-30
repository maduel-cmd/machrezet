import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { BeadDef } from './types';

export type DragGhost = {
  bead: BeadDef;
  x: number;
  y: number;
  rotation: number;
  snapping: boolean;
};

type Options = {
  onThread: (bead: BeadDef) => void;
  disabled?: boolean;
};

/**
 * השחלת חרוז: גרירה מהמגש אל החוט + tap-to-add כ־fallback.
 * מאזינים ברמת window — לא נתקעים במצב dragging.
 */
export function useThreadDrag({ onThread, disabled = false }: Options) {
  const [ghost, setGhost] = useState<DragGhost | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef<{
    bead: BeadDef;
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>(null);
  const velRef = useRef(0);

  const isOverStage = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const padX = Math.min(48, r.width * 0.08);
    const midY = r.top + r.height * 0.48;
    const magnetH = Math.max(72, r.height * 0.55);
    return (
      clientX >= r.left + padX &&
      clientX <= r.right - padX &&
      Math.abs(clientY - midY) <= magnetH / 2
    );
  }, []);

  const cancel = useCallback(() => {
    activeRef.current = null;
    setGhost(null);
    velRef.current = 0;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const a = activeRef.current;
      if (!a || e.pointerId !== a.pointerId) return;
      const dx = e.clientX - a.startX;
      const dy = e.clientY - a.startY;
      if (!a.moved && dx * dx + dy * dy > 36) a.moved = true;
      const vx = e.clientX - a.lastX;
      a.lastX = e.clientX;
      a.lastY = e.clientY;
      velRef.current = vx * 0.35 + velRef.current * 0.65;
      const snapping = isOverStage(e.clientX, e.clientY);
      setGhost({
        bead: a.bead,
        x: e.clientX,
        y: e.clientY,
        rotation: Math.max(-8, Math.min(8, velRef.current * 0.4)),
        snapping,
      });
      stageRef.current?.classList.toggle('snap-ready', snapping);
    };

    const onUp = (e: PointerEvent) => {
      const a = activeRef.current;
      if (!a || e.pointerId !== a.pointerId) return;

      const over = isOverStage(e.clientX, e.clientY);
      const wasTap = !a.moved;
      const bead = a.bead;
      stageRef.current?.classList.remove('snap-ready');
      cancel();

      if (disabled) return;
      if (wasTap || over) {
        onThread(bead);
        if (stageRef.current) {
          stageRef.current.classList.add('just-threaded');
          window.setTimeout(() => stageRef.current?.classList.remove('just-threaded'), 560);
        }
      }
    };

    const onCancelEvt = (e: PointerEvent) => {
      const a = activeRef.current;
      if (!a || e.pointerId !== a.pointerId) return;
      stageRef.current?.classList.remove('snap-ready');
      cancel();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancelEvt);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancelEvt);
    };
  }, [cancel, disabled, isOverStage, onThread]);

  const beginDrag = useCallback(
    (bead: BeadDef, e: ReactPointerEvent) => {
      if (disabled || e.button !== 0) return;
      // Pointer only — מונע כפילות עם touch/mouse סינתטיים
      e.preventDefault();
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      activeRef.current = {
        bead,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
      };
      velRef.current = 0;
      setGhost({
        bead,
        x: e.clientX,
        y: e.clientY,
        rotation: 0,
        snapping: isOverStage(e.clientX, e.clientY),
      });
    },
    [disabled, isOverStage],
  );

  return { ghost, beginDrag, stageRef, cancel, isDragging: ghost != null };
}
