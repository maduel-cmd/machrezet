import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { BEAD_CATALOG, beadsByCategory } from '../data/beads';
import type { BeadCategory, BeadDef } from '../lib/types';
import { getTheme } from '../lib/themes';
import { themeCharmBeads, themePaletteBeads } from '../lib/themeBeads';
import { useSyncedPrefs } from './ThemeSwitcher';
import { BeadVisual } from './BeadVisual';

/** מגשי יצירה — אייקונים לילדים */
type TrayTab = 'beads' | 'charms' | 'letters';

const TRAY_TABS: Array<{ id: TrayTab; label: string; icon: string }> = [
  { id: 'beads', label: 'חרוזים', icon: '🔴' },
  { id: 'charms', label: 'תליונים', icon: '✨' },
  { id: 'letters', label: 'אותיות', icon: '🔤' },
];

/** צבעים קצרים למגש חומרים — ללא שמות ארוכים */
const BEAD_MATERIALS: Array<{ id: BeadCategory; swatch: string; label: string }> = [
  { id: 'pony', swatch: '#E85D4C', label: 'פוני' },
  { id: 'pearl', swatch: '#F5E6D3', label: 'פנינים' },
  { id: 'gemstone', swatch: '#7B4B94', label: 'אבנים' },
  { id: 'crystal', swatch: '#8EC5E8', label: 'קריסטל' },
  { id: 'heishi', swatch: '#2A9D8F', label: 'היישי' },
  { id: 'metal', swatch: '#C9A227', label: 'מתכת' },
  { id: 'wood', swatch: '#8B5E3C', label: 'עץ' },
  { id: 'seed', swatch: '#D4A017', label: 'זרעים' },
];

export function BeadPalette({
  onPick,
  onDragStart,
  letterFilter,
}: {
  onPick: (bead: BeadDef) => void;
  /** התחלת גרירה להשחלה — אם מסופק, גם tap מטופל ע״י מערכת הגרירה */
  onDragStart?: (bead: BeadDef, e: ReactPointerEvent) => void;
  letterFilter?: string;
}) {
  const { themeId } = useSyncedPrefs();
  const theme = getTheme(themeId);
  const preferred = (theme.preferredMaterial ?? 'pony') as BeadCategory;
  const [tray, setTray] = useState<TrayTab>('beads');
  const [material, setMaterial] = useState<BeadCategory>(preferred);
  const [query, setQuery] = useState('');
  const [letterStyle, setLetterStyle] = useState('ltr-white');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const next = (theme.preferredMaterial ?? 'pony') as BeadCategory;
    if (BEAD_MATERIALS.some((m) => m.id === next)) setMaterial(next);
  }, [theme.preferredMaterial, themeId]);

  const category: BeadCategory = tray === 'letters' ? 'letter' : tray === 'charms' ? 'charm' : material;

  const worldCharms = useMemo(() => themeCharmBeads(themeId), [themeId]);
  const worldPalette = useMemo(() => themePaletteBeads(themeId), [themeId]);

  const items = useMemo(() => {
    // לשונית תליונים — 6 צ'ארמים וקטוריים של העולם (+ שאר התליונים)
    if (tray === 'charms') {
      let list = [...worldCharms, ...beadsByCategory('charm').filter((b) => !b.svgMarkup)];
      const q = query.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (b) => b.nameHe.includes(query.trim()) || b.id.toLowerCase().includes(q),
        );
      }
      return list;
    }

    // לשונית חרוזים — פלטת צבעי העולם בראש, ואז חומר נבחר
    if (tray === 'beads') {
      let list =
        material === 'pony'
          ? [...worldPalette, ...beadsByCategory('pony')]
          : beadsByCategory(material);
      const q = query.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (b) =>
            b.nameHe.includes(query.trim()) ||
            b.id.toLowerCase().includes(q) ||
            (b.letter && b.letter.toLowerCase() === q),
        );
      }
      return list;
    }

    let list = BEAD_CATALOG.filter((b) => b.category === 'letter' && b.id.startsWith(letterStyle));

    if (letterFilter) {
      const q = letterFilter.trim();
      if (q) list = list.filter((b) => b.letter === q);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.nameHe.includes(query.trim()) ||
          b.id.toLowerCase().includes(q) ||
          (b.letter && b.letter.toLowerCase() === q),
      );
    }

    if (!query && !letterFilter) {
      list = list.slice(0, 48);
    }
    return list;
  }, [
    tray,
    material,
    query,
    letterStyle,
    letterFilter,
    worldCharms,
    worldPalette,
    category,
  ]);

  return (
    <div className="bead-palette craft-tray" aria-label="מגש יצירה">
      <div className="tray-tabs" role="tablist" aria-label="מגשים">
        {TRAY_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tray === t.id}
            className={tray === t.id ? 'is-active' : ''}
            onClick={() => setTray(t.id)}
          >
            <span className="tray-tab-icon" aria-hidden>
              {t.icon}
            </span>
            <span className="tray-tab-label">{t.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`tray-search-toggle${showSearch ? ' is-active' : ''}`}
          aria-label="חיפוש"
          aria-pressed={showSearch}
          onClick={() => setShowSearch((v) => !v)}
        >
          ⌕
        </button>
      </div>

      {tray === 'beads' ? (
        <div className="material-chips material-swatches" role="tablist" aria-label="צבע וחומר">
          {BEAD_MATERIALS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={material === c.id}
              aria-label={c.label}
              title={c.label}
              className={`material-swatch${material === c.id ? ' is-active' : ''}`}
              style={{ '--swatch': c.swatch } as CSSProperties}
              onClick={() => setMaterial(c.id)}
            />
          ))}
        </div>
      ) : null}

      {tray === 'charms' ? (
        <p className="tray-world-hint" aria-live="polite">
          תליוני העולם · {theme.nameHe}
        </p>
      ) : null}

      {tray === 'letters' || showSearch ? (
        <div className="palette-tools">
          {showSearch ? (
            <input
              type="search"
              placeholder="חיפוש חרוז או אות…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="חיפוש חרוזים"
              autoFocus={showSearch}
            />
          ) : null}
          {tray === 'letters' ? (
            <select
              value={letterStyle}
              onChange={(e) => setLetterStyle(e.target.value)}
              aria-label="סגנון אות"
            >
              <option value="ltr-white">לבן</option>
              <option value="ltr-gold">זהב</option>
              <option value="ltr-black">שחור</option>
              <option value="ltr-pink">ורוד</option>
              <option value="ltr-sky">שמיים</option>
            </select>
          ) : null}
        </div>
      ) : null}

      <div className="palette-grid palette-tray-wells" role="list">
        {items.map((bead) => (
          <div key={bead.id} role="listitem" className="palette-item palette-item--silent">
            <div className="palette-well">
              <BeadVisual
                bead={bead}
                title={onDragStart ? `${bead.nameHe} — גררו לחוט או הקישו` : bead.nameHe}
                onClick={onDragStart ? undefined : () => onPick(bead)}
                onPointerDown={onDragStart ? (e) => onDragStart(bead, e) : undefined}
              />
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="muted">לא נמצאו חרוזים</p> : null}
      </div>
    </div>
  );
}
