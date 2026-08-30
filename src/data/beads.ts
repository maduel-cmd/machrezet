import type { BeadDef } from '../lib/types';
import { getThemeCharmBead, getThemePaletteBead } from '../lib/themeBeads';

const PONY_COLORS: Array<{ id: string; nameHe: string; color: string; highlight: string }> = [
  { id: 'pony-coral', nameHe: 'פוני אלמוג', color: '#E85D4C', highlight: '#FFB4A8' },
  { id: 'pony-sunset', nameHe: 'פוני שקיעה', color: '#F08A24', highlight: '#FFD19A' },
  { id: 'pony-butter', nameHe: 'פוני חמאה', color: '#F2C94C', highlight: '#FFF0A8' },
  { id: 'pony-mint', nameHe: 'פוני מנטה', color: '#3DBB8A', highlight: '#A8F0D0' },
  { id: 'pony-teal', nameHe: 'פוני טורקיז', color: '#2A9D8F', highlight: '#7EE0D4' },
  { id: 'pony-sky', nameHe: 'פוני שמיים', color: '#4BA3C7', highlight: '#A8E0F5' },
  { id: 'pony-indigo', nameHe: 'פוני אינדיגו', color: '#3D5A80', highlight: '#8FB4E0' },
  { id: 'pony-lilac', nameHe: 'פוני לילך', color: '#9B6B9E', highlight: '#E0C0E8' },
  { id: 'pony-blush', nameHe: 'פוני ורוד', color: '#E091A8', highlight: '#F8D0DC' },
  { id: 'pony-snow', nameHe: 'פוני שלג', color: '#F5F0E8', highlight: '#FFFFFF' },
  { id: 'pony-ink', nameHe: 'פוני דיו', color: '#2C2A28', highlight: '#6A6560' },
  { id: 'pony-gold', nameHe: 'פוני זהב', color: '#C9A227', highlight: '#F5E6A0' },
];

const GEMS: Array<{ id: string; nameHe: string; color: string; highlight: string; rarity: BeadDef['rarity'] }> = [
  { id: 'gem-amethyst', nameHe: 'אמטיסט', color: '#7B3FA0', highlight: '#D4A0F0', rarity: 'uncommon' },
  { id: 'gem-rose-quartz', nameHe: 'קוורץ ורוד', color: '#E8A0B8', highlight: '#FFE0EC', rarity: 'common' },
  { id: 'gem-turquoise', nameHe: 'טורקיז', color: '#40B4A8', highlight: '#A0F0E8', rarity: 'uncommon' },
  { id: 'gem-jade', nameHe: 'ירקן', color: '#2E8B57', highlight: '#90E0B0', rarity: 'uncommon' },
  { id: 'gem-malachite', nameHe: 'מלכיט', color: '#0B6E4F', highlight: '#5FCF9A', rarity: 'rare' },
  { id: 'gem-aquamarine', nameHe: 'אקוומרין', color: '#6EC6D8', highlight: '#C8F0F8', rarity: 'uncommon' },
  { id: 'gem-tigers-eye', nameHe: 'עין הנמר', color: '#B87333', highlight: '#E8C080', rarity: 'uncommon' },
  { id: 'gem-lapis', nameHe: 'לפיס לזולי', color: '#1E3A8A', highlight: '#6B9AFF', rarity: 'rare' },
  { id: 'gem-citrine', nameHe: 'ציטרין', color: '#E0A020', highlight: '#FFE08A', rarity: 'uncommon' },
  { id: 'gem-garnet', nameHe: 'גרנט', color: '#8B1A1A', highlight: '#E06060', rarity: 'rare' },
  { id: 'gem-onyx', nameHe: 'אוניקס', color: '#1A1A1A', highlight: '#555555', rarity: 'common' },
  { id: 'gem-moonstone', nameHe: 'אבן ירח', color: '#C8D4E0', highlight: '#FFFFFF', rarity: 'rare' },
  { id: 'gem-obsidian', nameHe: 'אובסידיאן', color: '#0D0D0D', highlight: '#3A3A50', rarity: 'common' },
  { id: 'gem-carnelian', nameHe: 'קרנליאן', color: '#D35400', highlight: '#FFB070', rarity: 'uncommon' },
  { id: 'gem-peridot', nameHe: 'פרידוט', color: '#8BC34A', highlight: '#D4F0A0', rarity: 'uncommon' },
  { id: 'gem-sapphire', nameHe: 'ספיר', color: '#0F52BA', highlight: '#6AA0FF', rarity: 'legendary' },
  { id: 'gem-emerald', nameHe: 'אמרלד', color: '#046307', highlight: '#40C060', rarity: 'legendary' },
  { id: 'gem-ruby', nameHe: 'רובי', color: '#9B111E', highlight: '#FF6070', rarity: 'legendary' },
];

const LETTER_STYLES: Array<{ prefix: string; nameHe: string; color: string; highlight: string; bg: string }> = [
  { prefix: 'ltr-white', nameHe: 'אות לבנה', color: '#2C2A28', highlight: '#FFFFFF', bg: '#F8F4EC' },
  { prefix: 'ltr-gold', nameHe: 'אות זהב', color: '#5A4010', highlight: '#F5E6A0', bg: '#C9A227' },
  { prefix: 'ltr-black', nameHe: 'אות שחורה', color: '#F5F0E8', highlight: '#666666', bg: '#1A1A1A' },
  { prefix: 'ltr-pink', nameHe: 'אות ורודה', color: '#5A2040', highlight: '#FFD0E0', bg: '#E091A8' },
  { prefix: 'ltr-sky', nameHe: 'אות שמיים', color: '#103040', highlight: '#C0E8F8', bg: '#4BA3C7' },
];

const HE_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';
const EN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

function letterBeads(): BeadDef[] {
  const out: BeadDef[] = [];
  for (const style of LETTER_STYLES) {
    for (const ch of EN_LETTERS) {
      out.push({
        id: `${style.prefix}-en-${ch}`,
        nameHe: `${style.nameHe} ${ch}`,
        category: 'letter',
        shape: 'cube',
        color: style.bg,
        highlight: style.highlight,
        letter: ch,
        size: 'md',
        rarity: 'common',
      });
    }
    for (const ch of HE_LETTERS) {
      out.push({
        id: `${style.prefix}-he-${ch}`,
        nameHe: `${style.nameHe} ${ch}`,
        category: 'letter',
        shape: 'cube',
        color: style.bg,
        highlight: style.highlight,
        letter: ch,
        size: 'md',
        rarity: 'common',
      });
    }
    for (const ch of DIGITS) {
      out.push({
        id: `${style.prefix}-n-${ch}`,
        nameHe: `${style.nameHe} ${ch}`,
        category: 'letter',
        shape: 'cube',
        color: style.bg,
        highlight: style.highlight,
        letter: ch,
        size: 'md',
        rarity: 'common',
      });
    }
  }
  return out;
}

const HEISHI: BeadDef[] = [
  { id: 'hei-coral', nameHe: 'היישי אלמוג', category: 'heishi', shape: 'disc', color: '#E85D4C', highlight: '#FFB4A8', size: 'xs', rarity: 'common' },
  { id: 'hei-mint', nameHe: 'היישי מנטה', category: 'heishi', shape: 'disc', color: '#3DBB8A', highlight: '#A8F0D0', size: 'xs', rarity: 'common' },
  { id: 'hei-sand', nameHe: 'היישי חול', category: 'heishi', shape: 'disc', color: '#D4A574', highlight: '#F0D8B8', size: 'xs', rarity: 'common' },
  { id: 'hei-clay', nameHe: 'היישי חימר', category: 'heishi', shape: 'disc', color: '#A67C52', highlight: '#D4B090', size: 'xs', rarity: 'common' },
  { id: 'hei-navy', nameHe: 'היישי נייבי', category: 'heishi', shape: 'disc', color: '#2C3E6B', highlight: '#7A90C0', size: 'xs', rarity: 'common' },
  { id: 'hei-cream', nameHe: 'היישי שמנת', category: 'heishi', shape: 'disc', color: '#EDE4D4', highlight: '#FFFFFF', size: 'xs', rarity: 'common' },
];

const PEARLS: BeadDef[] = [
  { id: 'pearl-cream', nameHe: 'פנינה שמנת', category: 'pearl', shape: 'round', color: '#F5EDE0', highlight: '#FFFFFF', size: 'md', rarity: 'uncommon' },
  { id: 'pearl-pink', nameHe: 'פנינה ורודה', category: 'pearl', shape: 'round', color: '#F0D0D8', highlight: '#FFF0F4', size: 'md', rarity: 'uncommon' },
  { id: 'pearl-gray', nameHe: 'פנינה אפורה', category: 'pearl', shape: 'round', color: '#A8A8B0', highlight: '#E0E0E8', size: 'md', rarity: 'rare' },
  { id: 'pearl-black', nameHe: 'פנינה שחורה', category: 'pearl', shape: 'round', color: '#2A2A30', highlight: '#707080', size: 'md', rarity: 'rare' },
];

const CRYSTALS: BeadDef[] = [
  { id: 'cry-clear', nameHe: 'קריסטל שקוף', category: 'crystal', shape: 'faceted', color: '#E8F4F8', highlight: '#FFFFFF', size: 'sm', rarity: 'common' },
  { id: 'cry-aurora', nameHe: 'קריסטל אורורה', category: 'crystal', shape: 'faceted', color: '#C8A0E8', highlight: '#FFFFFF', size: 'sm', rarity: 'rare' },
  { id: 'cry-champagne', nameHe: 'קריסטל שמפניה', category: 'crystal', shape: 'faceted', color: '#E8D0A0', highlight: '#FFF8E0', size: 'sm', rarity: 'uncommon' },
  { id: 'cry-ocean', nameHe: 'קריסטל אוקיינוס', category: 'crystal', shape: 'faceted', color: '#4080C0', highlight: '#A0D0FF', size: 'sm', rarity: 'uncommon' },
  { id: 'cry-ruby-glass', nameHe: 'זכוכית אודם', category: 'crystal', shape: 'faceted', color: '#C03050', highlight: '#FF90A8', size: 'sm', rarity: 'uncommon' },
];

const METAL: BeadDef[] = [
  { id: 'met-gold-rondelle', nameHe: 'רונדל זהב', category: 'metal', shape: 'disc', color: '#C9A227', highlight: '#F5E6A0', size: 'sm', rarity: 'common' },
  { id: 'met-silver-rondelle', nameHe: 'רונדל כסף', category: 'metal', shape: 'disc', color: '#C0C0C8', highlight: '#FFFFFF', size: 'sm', rarity: 'common' },
  { id: 'met-rose-rondelle', nameHe: 'רונדל רוזגולד', category: 'metal', shape: 'disc', color: '#B76E79', highlight: '#F0C0C8', size: 'sm', rarity: 'common' },
  { id: 'met-gold-tube', nameHe: 'צינורית זהב', category: 'metal', shape: 'tube', color: '#C9A227', highlight: '#F5E6A0', size: 'sm', rarity: 'uncommon' },
  { id: 'met-silver-tube', nameHe: 'צינורית כסף', category: 'metal', shape: 'tube', color: '#B8B8C0', highlight: '#FFFFFF', size: 'sm', rarity: 'uncommon' },
  { id: 'met-silver-oval', nameHe: 'אליפסת כסף', category: 'metal', shape: 'oval', color: '#B8B8C0', highlight: '#FFFFFF', size: 'sm', rarity: 'uncommon' },
  { id: 'met-rose-oval', nameHe: 'אליפסת רוזגולד', category: 'metal', shape: 'oval', color: '#B76E79', highlight: '#F0C0C8', size: 'sm', rarity: 'uncommon' },
  { id: 'met-gold-ball', nameHe: 'כדור זהב', category: 'metal', shape: 'round', color: '#C9A227', highlight: '#F5E6A0', size: 'md', rarity: 'rare' },
];

const WOOD: BeadDef[] = [
  { id: 'wood-oak', nameHe: 'עץ אלון', category: 'wood', shape: 'round', color: '#8B5E3C', highlight: '#C4A882', size: 'md', rarity: 'common' },
  { id: 'wood-walnut', nameHe: 'עץ אגוז', category: 'wood', shape: 'round', color: '#5C3A21', highlight: '#A07850', size: 'md', rarity: 'common' },
  { id: 'wood-maple', nameHe: 'עץ אדר', category: 'wood', shape: 'round', color: '#C4A06A', highlight: '#E8D0A0', size: 'md', rarity: 'uncommon' },
  { id: 'wood-rosewood', nameHe: 'עץ רוזווד', category: 'wood', shape: 'round', color: '#6B2E2E', highlight: '#B06060', size: 'md', rarity: 'rare' },
  { id: 'wood-bamboo', nameHe: 'במבוק', category: 'wood', shape: 'tube', color: '#C4A35A', highlight: '#E8D090', size: 'sm', rarity: 'common' },
  { id: 'wood-ebony', nameHe: 'עץ אבוני', category: 'wood', shape: 'round', color: '#2A1A12', highlight: '#6A5040', size: 'sm', rarity: 'rare' },
];

const CHARMS: BeadDef[] = [
  { id: 'chm-heart-red', nameHe: 'לב אדום', category: 'charm', shape: 'heart', color: '#D63031', highlight: '#FF8A8A', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-heart-gold', nameHe: 'לב זהב', category: 'charm', shape: 'heart', color: '#C9A227', highlight: '#F5E6A0', size: 'lg', rarity: 'rare' },
  { id: 'chm-heart-silver', nameHe: 'לב כסף', category: 'charm', shape: 'heart', color: '#C0C0C8', highlight: '#FFFFFF', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-star-gold', nameHe: 'כוכב זהב', category: 'charm', shape: 'star', color: '#C9A227', highlight: '#F5E6A0', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-star-silver', nameHe: 'כוכב כסף', category: 'charm', shape: 'star', color: '#C0C0C8', highlight: '#FFFFFF', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-star-rose', nameHe: 'כוכב רוזגולד', category: 'charm', shape: 'star', color: '#B76E79', highlight: '#F0C0C8', size: 'lg', rarity: 'rare' },
  { id: 'chm-moon', nameHe: 'ירח', category: 'charm', shape: 'oval', color: '#E8E0C0', highlight: '#FFFFFF', size: 'lg', rarity: 'rare' },
  { id: 'chm-moon-silver', nameHe: 'ירח כסף', category: 'charm', shape: 'oval', color: '#C0C0C8', highlight: '#FFFFFF', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-leaf-moss', nameHe: 'עלה ירוק', category: 'charm', shape: 'leaf', color: '#3D8B5A', highlight: '#A8E8B8', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-leaf-gold', nameHe: 'עלה זהב', category: 'charm', shape: 'leaf', color: '#C9A227', highlight: '#F5E6A0', size: 'lg', rarity: 'rare' },
  { id: 'chm-shell-peach', nameHe: 'צדף אפרסק', category: 'charm', shape: 'shell', color: '#F0B8A0', highlight: '#FFE8DC', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-shell-aqua', nameHe: 'צדף טורקיז', category: 'charm', shape: 'shell', color: '#6EC6D8', highlight: '#C8F0F8', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-flower-pink', nameHe: 'פרח ורוד', category: 'charm', shape: 'flower', color: '#E091A8', highlight: '#F8D0DC', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-flower-lilac', nameHe: 'פרח לילך', category: 'charm', shape: 'flower', color: '#9B6B9E', highlight: '#E0C0E8', size: 'lg', rarity: 'rare' },
  { id: 'chm-flower-terracotta', nameHe: 'פרח טרקוטה', category: 'charm', shape: 'flower', color: '#E07A5F', highlight: '#F5C4B0', size: 'lg', rarity: 'uncommon' },
  { id: 'chm-crystal-violet', nameHe: 'קריסטל סגול', category: 'charm', shape: 'faceted', color: '#7B3FA0', highlight: '#D4A0F0', size: 'lg', rarity: 'rare' },
];

const SEEDS: BeadDef[] = [
  { id: 'seed-gold', nameHe: 'חרוז זרע זהב', category: 'seed', shape: 'round', color: '#C9A227', highlight: '#F5E6A0', size: 'xs', rarity: 'common' },
  { id: 'seed-bronze', nameHe: 'חרוז זרע ברונזה', category: 'seed', shape: 'round', color: '#8B6914', highlight: '#D4A84A', size: 'xs', rarity: 'common' },
  { id: 'seed-black', nameHe: 'חרוז זרע שחור', category: 'seed', shape: 'round', color: '#1A1A1A', highlight: '#555555', size: 'xs', rarity: 'common' },
  { id: 'seed-glass-blue', nameHe: 'זרע זכוכית כחול', category: 'seed', shape: 'round', color: '#2E5A8B', highlight: '#80B0E0', size: 'xs', rarity: 'common' },
];

export const BEAD_CATALOG: BeadDef[] = [
  ...PONY_COLORS.map((p) => ({
    id: p.id,
    nameHe: p.nameHe,
    category: 'pony' as const,
    shape: 'round' as const,
    color: p.color,
    highlight: p.highlight,
    size: 'md' as const,
    rarity: 'common' as const,
  })),
  ...GEMS.map((g) => ({
    id: g.id,
    nameHe: g.nameHe,
    category: 'gemstone' as const,
    shape: 'faceted' as const,
    color: g.color,
    highlight: g.highlight,
    size: 'md' as const,
    rarity: g.rarity,
  })),
  ...letterBeads(),
  ...HEISHI,
  ...PEARLS,
  ...CRYSTALS,
  ...METAL,
  ...WOOD,
  ...CHARMS,
  ...SEEDS,
];

const byId = new Map(BEAD_CATALOG.map((b) => [b.id, b]));

export function getBead(id: string): BeadDef | undefined {
  return byId.get(id) ?? getThemeCharmBead(id) ?? getThemePaletteBead(id);
}

export function beadsByCategory(category: BeadDef['category']): BeadDef[] {
  return BEAD_CATALOG.filter((b) => b.category === category);
}

export const CATEGORY_LABELS: Record<BeadDef['category'], string> = {
  pony: 'פוני',
  letter: 'אותיות',
  gemstone: 'אבנים יקרות',
  pearl: 'פנינים',
  heishi: 'היישי',
  crystal: 'קריסטל',
  metal: 'מתכת',
  wood: 'עץ',
  charm: 'קישוטים',
  seed: 'זרעים',
};

export const PRODUCT_LABELS = {
  bracelet: 'צמיד',
  necklace: 'שרשרת',
  ornament: 'קישוט',
} as const;

export const CORD_COLORS = [
  { id: 'cord-elastic-clear', nameHe: 'אלסטי שקוף', color: '#E8E4DC' },
  { id: 'cord-elastic-black', nameHe: 'אלסטי שחור', color: '#2C2A28' },
  { id: 'cord-gold', nameHe: 'שרשרת זהב', color: '#C9A227' },
  { id: 'cord-silver', nameHe: 'שרשרת כסף', color: '#A8A8B0' },
  { id: 'cord-rose', nameHe: 'שרשרת רוזגולד', color: '#B76E79' },
  { id: 'cord-teal', nameHe: 'חוט טורקיז', color: '#2A9D8F' },
  { id: 'cord-coral', nameHe: 'חוט אלמוג', color: '#E85D4C' },
] as const;
