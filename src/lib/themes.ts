/** ערכות נושא חזותיות — מחרזת */

export type ThemeId =
  | 'fairy-forest'
  | 'magic-apothecary'
  | 'pastel-beach'
  | 'candy-kingdom'
  | 'starlight-cosmic'
  | 'boho-studio';

export type ThemeDef = {
  id: ThemeId;
  nameHe: string;
  emoji: string;
  blurbHe: string;
  /** תליונים / חרוזים שמופיעים בראש מגש התליונים */
  noveltyBeadIds: string[];
  /** חומר מועדף במגש החרוזים */
  preferredMaterial?: string;
};

export const THEMES: ThemeDef[] = [
  {
    id: 'fairy-forest',
    nameHe: 'יער הפיות',
    emoji: '🧚‍♀️',
    blurbHe: 'ירוק זוהר וגחליליות',
    noveltyBeadIds: ['theme-fairyForest-leaf', 'theme-fairyForest-mushroom', 'theme-fairyForest-flower'],
    preferredMaterial: 'pony',
  },
  {
    id: 'magic-apothecary',
    nameHe: 'חנות קסמים',
    emoji: '🔮',
    blurbHe: 'סגול זהוב ונרות',
    noveltyBeadIds: ['theme-magicApothecary-potion', 'theme-magicApothecary-crystal', 'theme-magicApothecary-wandStar'],
    preferredMaterial: 'pony',
  },
  {
    id: 'pastel-beach',
    nameHe: 'חוף פסטל',
    emoji: '🐚',
    blurbHe: 'ים רך וחול זהוב',
    noveltyBeadIds: ['theme-pastelBeach-seashell', 'theme-pastelBeach-starfish', 'theme-pastelBeach-pearl'],
    preferredMaterial: 'pony',
  },
  {
    id: 'candy-kingdom',
    nameHe: 'ממלכת ממתקים',
    emoji: '🍭',
    blurbHe: 'וורוד צמר גפן',
    noveltyBeadIds: ['theme-candyKingdom-gummyBear', 'theme-candyKingdom-lollipop', 'theme-candyKingdom-donut'],
    preferredMaterial: 'pony',
  },
  {
    id: 'starlight-cosmic',
    nameHe: 'גלקסיה',
    emoji: '🪐',
    blurbHe: 'לילה זוהר וניאון',
    noveltyBeadIds: ['theme-starlightCosmic-planet', 'theme-starlightCosmic-star', 'theme-starlightCosmic-rocket'],
    preferredMaterial: 'pony',
  },
  {
    id: 'boho-studio',
    nameHe: 'סטודיו בוהו',
    emoji: '🪴',
    blurbHe: 'קרם, טרקוטה ועץ',
    noveltyBeadIds: ['theme-bohoStudio-monstera', 'theme-bohoStudio-vase', 'theme-bohoStudio-woodRing'],
    preferredMaterial: 'pony',
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'boho-studio';

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && THEMES.some((t) => t.id === v);
}

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[THEMES.length - 1]!;
}
