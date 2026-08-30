import { useId, useMemo } from 'react';
import { namespaceSvgMarkup } from '../lib/themeBeads';

/**
 * רינדור SVG וקטורי של צ'ארם עולם — עם IDs ייחודיים למניעת התנגשות gradients.
 */
export function CharmSvgMarkup({
  markup,
  size = 44,
  className,
}: {
  markup: string;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const html = useMemo(() => namespaceSvgMarkup(markup, uid), [markup, uid]);

  return (
    <span
      className={className ?? 'charm-svg-markup'}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.22))',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-hidden
    />
  );
}
