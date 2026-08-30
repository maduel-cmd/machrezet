import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type Particle = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  rotate: string;
  size: string;
  drift: string;
};

const COLORS = [
  'var(--accent, #D48C70)',
  'var(--sea, #2D5A4C)',
  'var(--gold, #C4A574)',
  '#E091A8',
  '#3DBB8A',
  '#C9A227',
  '#fff',
  '#4cc9f0',
  '#ffd166',
];

/**
 * חגיגת קונפטי קלה לסיום יצירה.
 */
export function CelebrationBurst({
  active,
  durationMs = 2200,
}: {
  active: boolean;
  durationMs?: number;
}) {
  const [show, setShow] = useState(false);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 17) % 88)}%`,
        delay: `${(i % 8) * 0.05}s`,
        duration: `${0.9 + (i % 5) * 0.12}s`,
        color: COLORS[i % COLORS.length]!,
        rotate: `${(i * 37) % 360}deg`,
        size: `${6 + (i % 4) * 2}px`,
        drift: `${(i % 2 === 0 ? -1 : 1) * (12 + (i % 6) * 6)}px`,
      })),
    [],
  );

  useEffect(() => {
    if (!active) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs]);

  if (!show) return null;

  return (
    <div className="celebration-burst" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="celebration-particle"
          style={
            {
              left: p.left,
              background: p.color,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              '--rot': p.rotate,
              '--drift': p.drift,
            } as CSSProperties
          }
        />
      ))}
      <p className="celebration-banner">כל הכבוד! ✨</p>
    </div>
  );
}
