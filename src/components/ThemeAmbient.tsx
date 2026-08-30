import { useEffect } from 'react';
import type { ThemeId } from '../lib/themes';
import { applyThemePackCss, getThemePack, themeManager } from '../lib/machrezetThemeGraphics';

/**
 * שכבת רקע וקטורית מלאה (#game-background-layer) + סנכרון CSS Variables.
 */
export function ThemeAmbient({ themeId }: { themeId: ThemeId }) {
  const pack = getThemePack(themeId);

  useEffect(() => {
    applyThemePackCss(pack);
    themeManager.currentTheme = pack;
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: pack }));
  }, [pack, themeId]);

  return (
    <div
      id="game-background-layer"
      className="game-background-layer"
      data-react-owned="1"
      aria-hidden
    >
      <div
        className="game-background-svg-host"
        dangerouslySetInnerHTML={{ __html: pack.backgroundSvg }}
      />
    </div>
  );
}
