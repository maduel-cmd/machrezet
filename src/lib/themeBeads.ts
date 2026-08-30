import type { BeadDef } from './types';
import type { ThemeId } from './themes';
import {
  CHARM_NAME_HE,
  THEME_PACKS,
  getThemePack,
  type ThemePack,
} from './machrezetThemeGraphics';

/** מזהה חרוז צ'ארם וקטורי של עולם */
export function themeCharmBeadId(packId: string, charmKey: string): string {
  return `theme-${packId}-${charmKey}`;
}

export function isThemeCharmBeadId(id: string): boolean {
  return id.startsWith('theme-') && id.split('-').length >= 3;
}

/** כל צ'ארמי העולמות — לחיפוש ב־getBead / שמירות */
const ALL_THEME_CHARM_BEADS: BeadDef[] = Object.values(THEME_PACKS).flatMap((pack) =>
  Object.entries(pack.charms).map(([key, svg]) => charmToBead(pack, key, svg)),
);

const themeCharmById = new Map(ALL_THEME_CHARM_BEADS.map((b) => [b.id, b]));

function charmToBead(pack: ThemePack, key: string, svg: string): BeadDef {
  return {
    id: themeCharmBeadId(pack.id, key),
    nameHe: CHARM_NAME_HE[key] ?? key,
    category: 'charm',
    shape: 'round',
    color: pack.colors.accent,
    highlight: '#ffffff',
    size: 'lg',
    rarity: 'uncommon',
    svgMarkup: svg,
  };
}

/** חרוזי פלטת צבעים לפי עולם (פוני עגול מבריק) */
export function themePaletteBeads(themeId: ThemeId): BeadDef[] {
  const pack = getThemePack(themeId);
  return pack.colors.beadPalette.map((color, i) => ({
    id: `theme-palette-${pack.id}-${i}`,
    nameHe: `חרוז ${pack.name} ${i + 1}`,
    category: 'pony' as const,
    shape: 'round' as const,
    color,
    highlight: '#ffffff',
    size: 'md' as const,
    rarity: 'common' as const,
  }));
}

export function themeCharmBeads(themeId: ThemeId): BeadDef[] {
  const pack = getThemePack(themeId);
  return Object.entries(pack.charms).map(([key, svg]) => charmToBead(pack, key, svg));
}

export function getThemeCharmBead(id: string): BeadDef | undefined {
  return themeCharmById.get(id);
}

export function getThemePaletteBead(id: string): BeadDef | undefined {
  if (!id.startsWith('theme-palette-')) return undefined;
  // theme-palette-{packId}-{index} — packId is camelCase without hyphens
  const m = /^theme-palette-([a-zA-Z]+)-(\d+)$/.exec(id);
  if (!m) return undefined;
  const packId = m[1]!;
  const index = Number(m[2]);
  const pack = THEME_PACKS[packId as keyof typeof THEME_PACKS];
  if (!pack || !Number.isFinite(index)) return undefined;
  const color = pack.colors.beadPalette[index];
  if (!color) return undefined;
  return {
    id,
    nameHe: `חרוז ${pack.name} ${index + 1}`,
    category: 'pony',
    shape: 'round',
    color,
    highlight: '#ffffff',
    size: 'md',
    rarity: 'common',
  };
}

/** מחליף id/url(#id) ב־SVG כדי למנוע התנגשויות בין מופעים */
export function namespaceSvgMarkup(svg: string, uid: string): string {
  const ids = new Set<string>();
  svg.replace(/\bid="([^"]+)"/g, (_, id: string) => {
    ids.add(id);
    return '';
  });
  let out = svg;
  for (const id of ids) {
    const next = `${id}-${uid}`;
    out = out.split(`id="${id}"`).join(`id="${next}"`);
    out = out.split(`url(#${id})`).join(`url(#${next})`);
  }
  return out;
}
