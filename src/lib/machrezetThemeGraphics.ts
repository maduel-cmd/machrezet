/**
 * Machrezet Beads - Complete Vector Graphics & Themes Package
 * כולל איורי רקע מלאים, צ'ארמים מיוחדים, משטחי יצירה ופלטות צבעים ל-6 עולמות נושא
 */

import type { ThemeId } from './themes';

export type ThemePackId =
  | 'fairyForest'
  | 'magicApothecary'
  | 'pastelBeach'
  | 'candyKingdom'
  | 'starlightCosmic'
  | 'bohoStudio';

export type ThemePackColors = {
  background: string;
  primary: string;
  accent: string;
  surface: string;
  surfaceBorder: string;
  thread: string;
  text: string;
  beadPalette: string[];
};

export type ThemePack = {
  id: ThemePackId;
  name: string;
  nameEn: string;
  icon: string;
  colors: ThemePackColors;
  backgroundSvg: string;
  charms: Record<string, string>;
};

/** מיפוי מזהי האפליקציה (kebab) ↔ מפתחות החבילה (camel) */
export const THEME_ID_TO_PACK: Record<ThemeId, ThemePackId> = {
  'fairy-forest': 'fairyForest',
  'magic-apothecary': 'magicApothecary',
  'pastel-beach': 'pastelBeach',
  'candy-kingdom': 'candyKingdom',
  'starlight-cosmic': 'starlightCosmic',
  'boho-studio': 'bohoStudio',
};

export const PACK_ID_TO_THEME: Record<ThemePackId, ThemeId> = {
  fairyForest: 'fairy-forest',
  magicApothecary: 'magic-apothecary',
  pastelBeach: 'pastel-beach',
  candyKingdom: 'candy-kingdom',
  starlightCosmic: 'starlight-cosmic',
  bohoStudio: 'boho-studio',
};

export const CHARM_NAME_HE: Record<string, string> = {
  leaf: 'עלה פיות',
  mushroom: 'פטריית קסם',
  acorn: 'בלוט',
  fairyWing: 'כנף פיה',
  flower: 'פרח יער',
  dewdrop: 'טיפת טל',
  potion: 'שיקוי',
  crystal: 'גביש',
  moon: 'ירח',
  magicHat: 'כובע קוסם',
  wandStar: 'שרביט כוכב',
  spellBook: 'ספר כישופים',
  seashell: 'צדף',
  starfish: 'כוכב ים',
  pearl: 'פנינה',
  palmTree: 'דקל',
  turtle: 'צב ים',
  sunGlasses: 'משקפי שמש',
  gummyBear: 'דובי גומי',
  donut: 'דונאט',
  lollipop: 'סוכרייה על מקל',
  cupcake: 'קאפקייק',
  candyBonbon: 'בונבון',
  iceCream: 'גלידה',
  planet: 'כוכב לכת',
  rocket: 'חללית',
  star: 'כוכב',
  alienUfo: 'עב״ם',
  astronaut: 'אסטרונאוט',
  meteor: 'מטאור',
  monstera: 'מונסטרה',
  bohoEye: 'עין בוהו',
  vase: 'אגרטל',
  sunArch: 'קשת שמש',
  tassel: 'גדיל',
  woodRing: 'טבעת עץ',
};

export const THEME_PACKS: Record<ThemePackId, ThemePack> = {
  fairyForest: {
    id: 'fairyForest',
    name: 'יער הפיות',
    nameEn: 'Fairy Forest',
    icon: '🧚‍♀️',
    colors: {
      background: '#13241b',
      primary: '#2d5a3f',
      accent: '#ffd166',
      surface: 'rgba(30, 57, 42, 0.75)',
      surfaceBorder: '#5b8e6f',
      thread: '#a3d9b1',
      text: '#e7f7ec',
      beadPalette: ['#52b788', '#74c69d', '#95d5b2', '#d8f3dc', '#ffe66d', '#ffb703', '#b7e4c7', '#f3c68f']
    },
    // איור רקע וקטורי מלא ומפורט (נוף יער קסום עם פטריות זוהרות ועצים)
    backgroundSvg: `
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="theme-bg-svg">
        <defs>
          <linearGradient id="ffSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b1710"/>
            <stop offset="50%" stop-color="#143022"/>
            <stop offset="100%" stop-color="#244d36"/>
          </linearGradient>
          <radialGradient id="ffMoonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff8db" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#ffe699" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#143022" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="ffMushroomGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffd166" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ffd166" stop-opacity="0"/>
          </radialGradient>
          <filter id="ffBlur">
            <feGaussianBlur stdDeviation="4"/>
          </filter>
        </defs>
        
        <!-- שמי רקע -->
        <rect width="1440" height="900" fill="url(#ffSky)"/>
        
        <!-- ירח פיות זוהר -->
        <circle cx="1150" cy="180" r="140" fill="url(#ffMoonGlow)"/>
        <circle cx="1150" cy="180" r="45" fill="#fffdf2"/>

        <!-- עצים ברקע עמוק -->
        <path d="M-50 900 L80 400 L200 900 Z" fill="#0d1f16" opacity="0.6"/>
        <path d="M150 900 L320 350 L480 900 Z" fill="#0d1f16" opacity="0.5"/>
        <path d="M1000 900 L1200 320 L1380 900 Z" fill="#0d1f16" opacity="0.6"/>
        <path d="M1250 900 L1360 420 L1500 900 Z" fill="#0d1f16" opacity="0.7"/>

        <!-- ענפי עצים קדמיים עם עלים משתלשלים -->
        <g fill="#1a3b2b">
          <path d="M0 0 C300 80 500 40 700 0 L700 0 L0 0 Z"/>
          <path d="M800 0 C1000 120 1250 60 1440 0 L1440 0 L800 0 Z"/>
          <!-- מחרוזות גחליליות תלויות -->
          <circle cx="120" cy="90" r="5" fill="#ffe066" filter="url(#ffBlur)"/>
          <circle cx="120" cy="90" r="2.5" fill="#ffffff"/>
          <circle cx="280" cy="130" r="6" fill="#ffe066" filter="url(#ffBlur)"/>
          <circle cx="280" cy="130" r="3" fill="#ffffff"/>
          <circle cx="950" cy="110" r="5" fill="#a7f3d0" filter="url(#ffBlur)"/>
          <circle cx="1120" cy="140" r="6" fill="#ffe066" filter="url(#ffBlur)"/>
        </g>

        <!-- גבעות טחב וקרקעית יער -->
        <path d="M-100 900 Q200 700 600 820 T1440 750 L1440 900 Z" fill="#1b3829"/>
        <path d="M-50 900 Q400 760 900 850 T1500 800 L1500 900 Z" fill="#244835"/>

        <!-- פטריות קסם זוהרות בצדדים -->
        <g transform="translate(80, 680) scale(0.9)">
          <circle cx="50" cy="40" r="60" fill="url(#ffMushroomGlow)"/>
          <!-- רגל הפטרייה -->
          <path d="M40 50 Q50 110 35 140 L65 140 Q55 110 60 50 Z" fill="#ede8d0"/>
          <!-- כיפת הפטרייה -->
          <path d="M10 60 Q50 -10 90 60 Q50 45 10 60 Z" fill="#e63946"/>
          <circle cx="35" cy="30" r="6" fill="#ffffff" opacity="0.9"/>
          <circle cx="65" cy="25" r="5" fill="#ffffff" opacity="0.9"/>
          <circle cx="50" cy="45" r="4" fill="#ffffff" opacity="0.9"/>
        </g>

        <g transform="translate(1260, 690) scale(0.75)">
          <circle cx="50" cy="40" r="60" fill="url(#ffMushroomGlow)"/>
          <path d="M40 50 Q50 110 35 140 L65 140 Q55 110 60 50 Z" fill="#ede8d0"/>
          <path d="M10 60 Q50 -10 90 60 Q50 45 10 60 Z" fill="#ffb703"/>
          <circle cx="38" cy="28" r="6" fill="#ffffff" opacity="0.9"/>
          <circle cx="62" cy="35" r="5" fill="#ffffff" opacity="0.9"/>
        </g>
      </svg>
    `,
    // 6 צ'ארמים מיוחדים ליער הפיות
    charms: {
      leaf: `<svg viewBox="0 0 100 100"><defs><linearGradient id="clLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#95d5b2"/><stop offset="100%" stop-color="#2d6a4f"/></linearGradient></defs><path d="M50 10 C85 25 90 75 50 90 C10 75 15 25 50 10 Z" fill="url(#clLeaf)" stroke="#d8f3dc" stroke-width="2"/><path d="M50 15 L50 85 M50 35 L70 25 M50 55 L75 45 M50 45 L25 35 M50 65 L30 55" stroke="#d8f3dc" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      mushroom: `<svg viewBox="0 0 100 100"><path d="M42 50 Q50 85 40 92 L60 92 Q50 85 58 50 Z" fill="#f4f1de"/><path d="M18 55 C18 20 82 20 82 55 Q50 45 18 55 Z" fill="#e63946"/><circle cx="36" cy="35" r="4" fill="#fff"/><circle cx="64" cy="35" r="4" fill="#fff"/><circle cx="50" cy="45" r="3" fill="#fff"/><circle cx="50" cy="12" r="4" fill="#ffd166"/></svg>`,
      acorn: `<svg viewBox="0 0 100 100"><path d="M30 40 Q50 25 70 40 L70 46 Q50 42 30 46 Z" fill="#7f4f24"/><path d="M32 45 C32 75 45 92 50 92 C55 92 68 75 68 45 Z" fill="#b07d62"/><path d="M50 16 L50 30" stroke="#7f4f24" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="14" r="4" fill="#ffd166"/></svg>`,
      fairyWing: `<svg viewBox="0 0 100 100"><defs><linearGradient id="fwGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.9"/><stop offset="50%" stop-color="#a7f3d0" stop-opacity="0.7"/><stop offset="100%" stop-color="#6ee7b7" stop-opacity="0.3"/></linearGradient></defs><path d="M50 50 C20 10 70 5 85 30 C95 45 75 65 50 50 Z" fill="url(#fwGlow)" stroke="#fff" stroke-width="1.5"/><path d="M50 50 C25 60 40 90 65 85 C80 80 70 65 50 50 Z" fill="url(#fwGlow)" stroke="#fff" stroke-width="1.5"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      flower: `<svg viewBox="0 0 100 100"><g transform="translate(50,50)"><circle cx="0" cy="-24" r="14" fill="#ffb703"/><circle cx="23" cy="-8" r="14" fill="#ffb703"/><circle cx="14" cy="20" r="14" fill="#ffb703"/><circle cx="-14" cy="20" r="14" fill="#ffb703"/><circle cx="-23" cy="-8" r="14" fill="#ffb703"/><circle cx="0" cy="0" r="12" fill="#fff" stroke="#f4a261" stroke-width="2"/></g><circle cx="50" cy="8" r="4" fill="#52b788"/></svg>`,
      dewdrop: `<svg viewBox="0 0 100 100"><defs><radialGradient id="dewGlow" cx="35%" cy="35%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#72efdd"/><stop offset="100%" stop-color="#48cae4"/></radialGradient></defs><path d="M50 16 C30 45 25 65 30 78 C38 92 62 92 70 78 C75 65 70 45 50 16 Z" fill="url(#dewGlow)" stroke="#cbf3f0" stroke-width="1.5"/><ellipse cx="44" cy="60" rx="8" ry="12" fill="#fff" opacity="0.6"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`
    }
  },

  magicApothecary: {
    id: 'magicApothecary',
    name: 'חנות קסמים ושיקויים',
    nameEn: 'Magic Apothecary',
    icon: '🔮',
    colors: {
      background: '#150a21',
      primary: '#3a1c5c',
      accent: '#f72585',
      surface: 'rgba(45, 20, 75, 0.75)',
      surfaceBorder: '#9d4edd',
      thread: '#e0aaff',
      text: '#f3e8ff',
      beadPalette: ['#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff', '#f72585', '#7209b7', '#ffd166', '#4cc9f0']
    },
    backgroundSvg: `
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="theme-bg-svg">
        <defs>
          <linearGradient id="maWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#12071c"/>
            <stop offset="60%" stop-color="#220f36"/>
            <stop offset="100%" stop-color="#341553"/>
          </linearGradient>
          <radialGradient id="maOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ff9ebb" stop-opacity="1"/>
            <stop offset="40%" stop-color="#b5179e" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#220f36" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#maWall)"/>
        
        <!-- מדפי שיקויים עתיקים מעץ -->
        <rect x="60" y="160" width="380" height="18" fill="#4a2810" rx="4"/>
        <rect x="60" y="340" width="380" height="18" fill="#4a2810" rx="4"/>
        <rect x="1000" y="200" width="380" height="18" fill="#4a2810" rx="4"/>
        <rect x="1000" y="380" width="380" height="18" fill="#4a2810" rx="4"/>
        
        <!-- בקבוקוני שיקויים זוהרים על המדף השמאלי -->
        <!-- בקבוק 1 סגול -->
        <path d="M120 160 L120 125 L130 120 L130 110 L110 110 L110 120 L120 125 Z" fill="#c77dff" opacity="0.85"/>
        <ellipse cx="120" cy="140" rx="20" ry="18" fill="#7209b7"/>
        <circle cx="120" cy="140" r="14" fill="#e0aaff" opacity="0.6"/>

        <!-- בקבוק 2 ירוק קסום -->
        <path d="M220 160 L200 110 L240 110 Z" fill="#06d6a0" opacity="0.85"/>
        <rect x="215" y="100" width="10" height="10" fill="#ffd166"/>

        <!-- בקבוק 3 שיקוי אהבה ורוד -->
        <circle cx="320" cy="135" r="22" fill="#f72585"/>
        <rect x="314" y="105" width="12" height="12" fill="#d4af37"/>

        <!-- מדף ימני: ספר כשפים וגביש -->
        <path d="M1060 200 L1120 150 L1180 200 Z" fill="#9d4edd" opacity="0.75"/>
        <!-- גביש קריסטל מרחף -->
        <polygon points="1260,110 1280,150 1260,190 1240,150" fill="#4cc9f0" opacity="0.85"/>
        <circle cx="1260" cy="150" r="45" fill="url(#maOrb)" opacity="0.4"/>

        <!-- שולחן עבודה / מעבדה למטה -->
        <rect x="0" y="780" width="1440" height="120" fill="#2d1708"/>
        <rect x="0" y="770" width="1440" height="15" fill="#5c3417"/>

        <!-- עשן קסום מרחף -->
        <circle cx="720" cy="250" r="200" fill="url(#maOrb)" opacity="0.25"/>
      </svg>
    `,
    charms: {
      potion: `<svg viewBox="0 0 100 100"><defs><linearGradient id="potGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f72585"/><stop offset="100%" stop-color="#7209b7"/></linearGradient></defs><path d="M44 30 L44 42 C30 50 25 70 32 84 C38 94 62 94 68 84 C75 70 70 50 56 42 L56 30 Z" fill="url(#potGlow)" stroke="#ffd166" stroke-width="2"/><rect x="42" y="22" width="16" height="8" fill="#d4af37" rx="2"/><circle cx="50" cy="65" r="5" fill="#fff" opacity="0.6"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      crystal: `<svg viewBox="0 0 100 100"><defs><linearGradient id="crysGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4cc9f0"/><stop offset="100%" stop-color="#7209b7"/></linearGradient></defs><polygon points="50,18 74,40 64,88 36,88 26,40" fill="url(#crysGlow)" stroke="#e0aaff" stroke-width="2"/><polyline points="50,18 50,88 74,40 50,55 26,40 50,88" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      moon: `<svg viewBox="0 0 100 100"><path d="M56 22 C34 26 24 50 34 72 C44 90 70 92 80 80 C60 82 44 68 46 48 C48 34 54 26 56 22 Z" fill="#ffd166" stroke="#fff" stroke-width="1.5"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      magicHat: `<svg viewBox="0 0 100 100"><path d="M15 80 Q50 70 85 80 Q50 88 15 80 Z" fill="#3a0ca3"/><path d="M28 76 Q50 20 50 20 Q50 20 72 76 Z" fill="#560bad"/><path d="M26 74 Q50 68 74 74 L73 70 Q50 64 27 70 Z" fill="#f72585"/><polygon points="46,45 50,38 54,45 44,40 56,40" fill="#ffd166"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      wandStar: `<svg viewBox="0 0 100 100"><polygon points="50,22 56,38 72,38 58,48 64,64 50,54 36,64 42,48 28,38 44,38" fill="#ffd166" stroke="#fff" stroke-width="1.5"/><circle cx="50" cy="45" r="4" fill="#f72585"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      spellBook: `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="62" rx="4" fill="#7209b7" stroke="#ffd166" stroke-width="2"/><rect x="28" y="28" width="8" height="56" fill="#3f37c9"/><circle cx="54" cy="56" r="12" fill="none" stroke="#ffd166" stroke-width="2"/><polygon points="54,48 57,54 63,54 58,58 60,64 54,60 48,64 50,58 45,54 51,54" fill="#ffd166"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`
    }
  },

  pastelBeach: {
    id: 'pastelBeach',
    name: 'חוף פסטל טרופי',
    nameEn: 'Pastel Beach',
    icon: '🐚',
    colors: {
      background: '#9fe3de',
      primary: '#38a3a5',
      accent: '#ff6b6b',
      surface: 'rgba(255, 255, 255, 0.7)',
      surfaceBorder: '#48cae4',
      thread: '#57cc99',
      text: '#1d3557',
      beadPalette: ['#48cae4', '#90e0ef', '#ade8f4', '#ffb4a2', '#ff6b6b', '#ffd166', '#e9edc9', '#57cc99']
    },
    backgroundSvg: `
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="theme-bg-svg">
        <defs>
          <linearGradient id="pbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffccd5"/>
            <stop offset="40%" stop-color="#fff1e6"/>
            <stop offset="70%" stop-color="#cbf3f0"/>
            <stop offset="100%" stop-color="#72efdd"/>
          </linearGradient>
          <linearGradient id="pbSea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#48cae4"/>
            <stop offset="50%" stop-color="#00b4d8"/>
            <stop offset="100%" stop-color="#0096c7"/>
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#pbSky)"/>
        
        <!-- שמש שקיעה רכה -->
        <circle cx="720" cy="380" r="100" fill="#ffeaa7" opacity="0.8"/>
        
        <!-- ים בגווני טורקיז -->
        <path d="M0 450 Q360 430 720 450 T1440 450 L1440 680 L0 680 Z" fill="url(#pbSea)"/>
        <path d="M0 480 Q400 460 800 480 T1440 480 L1440 680 L0 680 Z" fill="#90e0ef" opacity="0.4"/>
        
        <!-- גלי קצף חוף -->
        <path d="M0 640 C300 620 600 660 900 630 C1200 600 1350 640 1440 635 L1440 665 C1350 660 1200 620 900 650 C600 680 300 640 0 660 Z" fill="#ffffff" opacity="0.8"/>
        
        <!-- חוף חול זהוב ופסטלי -->
        <path d="M0 660 Q400 620 800 650 T1440 640 L1440 900 L0 900 Z" fill="#ffe5b4"/>
        <path d="M0 720 Q600 680 1440 710 L1440 900 L0 900 Z" fill="#fed99b"/>

        <!-- עלי דקל טרופיים בצד ימין למעלה -->
        <g fill="#2d6a4f" opacity="0.85">
          <path d="M1440 0 C1250 80 1100 220 1050 350 C1120 280 1250 200 1440 160 Z"/>
          <path d="M1440 0 C1300 120 1200 280 1180 420 C1240 330 1340 240 1440 180 Z"/>
          <path d="M1440 80 C1300 180 1220 320 1200 480 C1260 380 1350 290 1440 250 Z"/>
        </g>
      </svg>
    `,
    charms: {
      seashell: `<svg viewBox="0 0 100 100"><defs><linearGradient id="shGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffccd5"/><stop offset="100%" stop-color="#ffb4a2"/></linearGradient></defs><path d="M50 85 C20 85 15 45 30 25 C40 12 60 12 70 25 C85 45 80 85 50 85 Z" fill="url(#shGrad)" stroke="#fff" stroke-width="2"/><path d="M50 85 L32 28 M50 85 L44 20 M50 85 L56 20 M50 85 L68 28" stroke="#ffffff" stroke-width="1.5"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      starfish: `<svg viewBox="0 0 100 100"><polygon points="50,20 59,38 79,40 64,54 69,74 50,63 31,74 36,54 21,40 41,38" fill="#ff6b6b" stroke="#fff" stroke-width="2"/><circle cx="50" cy="48" r="3" fill="#ffd166"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      pearl: `<svg viewBox="0 0 100 100"><defs><radialGradient id="prlGlow" cx="35%" cy="35%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="60%" stop-color="#e0fbfc"/><stop offset="100%" stop-color="#98c1d9"/></radialGradient></defs><circle cx="50" cy="54" r="32" fill="url(#prlGlow)" stroke="#fff" stroke-width="2"/><ellipse cx="40" cy="42" rx="8" ry="5" fill="#fff" opacity="0.8"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      palmTree: `<svg viewBox="0 0 100 100"><path d="M48 88 Q54 60 48 42 L54 42 Q60 60 54 88 Z" fill="#7f4f24"/><path d="M50 42 C30 35 20 20 22 18 C30 28 42 34 50 42 Z" fill="#2d6a4f"/><path d="M50 42 C70 35 80 20 78 18 C70 28 58 34 50 42 Z" fill="#2d6a4f"/><path d="M50 42 C50 20 40 10 38 10 C45 22 48 30 50 42 Z" fill="#40916c"/><path d="M50 42 C50 20 60 10 62 10 C55 22 52 30 50 42 Z" fill="#40916c"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      turtle: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="22" ry="26" fill="#52b788" stroke="#fff" stroke-width="1.5"/><circle cx="50" cy="24" r="9" fill="#74c69d"/><ellipse cx="28" cy="42" rx="6" ry="12" fill="#74c69d" transform="rotate(-30 28 42)"/><ellipse cx="72" cy="42" rx="6" ry="12" fill="#74c69d" transform="rotate(30 72 42)"/><ellipse cx="32" cy="74" rx="5" ry="10" fill="#74c69d" transform="rotate(30 32 74)"/><ellipse cx="68" cy="74" rx="5" ry="10" fill="#74c69d" transform="rotate(-30 68 74)"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      sunGlasses: `<svg viewBox="0 0 100 100"><rect x="20" y="44" width="26" height="20" rx="6" fill="#1d3557" stroke="#ffd166" stroke-width="2"/><rect x="54" y="44" width="26" height="20" rx="6" fill="#1d3557" stroke="#ffd166" stroke-width="2"/><path d="M46 52 L54 52" stroke="#ffd166" stroke-width="3"/><line x1="20" y1="48" x2="12" y2="44" stroke="#ffd166" stroke-width="2"/><line x1="80" y1="48" x2="88" y2="44" stroke="#ffd166" stroke-width="2"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`
    }
  },

  candyKingdom: {
    id: 'candyKingdom',
    name: 'ממלכת ממתקים',
    nameEn: 'Candy Kingdom',
    icon: '🍭',
    colors: {
      background: '#ffb3c6',
      primary: '#ff4d6d',
      accent: '#ffe66d',
      surface: 'rgba(255, 255, 255, 0.8)',
      surfaceBorder: '#ff758f',
      thread: '#c9184a',
      text: '#590d22',
      beadPalette: ['#ff4d6d', '#ff758f', '#ff85a1', '#f72585', '#7209b7', '#4cc9f0', '#ffe66d', '#ffffff']
    },
    backgroundSvg: `
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="theme-bg-svg">
        <defs>
          <linearGradient id="ckSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffccd5"/>
            <stop offset="50%" stop-color="#ffe5ec"/>
            <stop offset="100%" stop-color="#fcd5ce"/>
          </linearGradient>
          <linearGradient id="ckLolly" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff4d6d"/>
            <stop offset="50%" stop-color="#ffe66d"/>
            <stop offset="100%" stop-color="#4cc9f0"/>
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#ckSky)"/>
        
        <!-- ענני צמר גפן מתוק -->
        <g fill="#ffffff" opacity="0.85">
          <circle cx="200" cy="180" r="60"/>
          <circle cx="260" cy="160" r="70"/>
          <circle cx="330" cy="180" r="60"/>
          <circle cx="1100" cy="220" r="70"/>
          <circle cx="1180" cy="190" r="80"/>
          <circle cx="1260" cy="220" r="70"/>
        </g>
        
        <!-- גבעות שוקולד וסוכר -->
        <path d="M-50 900 Q250 650 600 780 T1440 700 L1440 900 Z" fill="#ff758f"/>
        <path d="M0 900 Q400 720 950 820 T1500 770 L1500 900 Z" fill="#ff4d6d"/>
        
        <!-- סוכריות ענק על מקל ברקע -->
        <!-- סוכריה שמאלית -->
        <rect x="180" y="480" width="14" height="240" fill="#fff" rx="6"/>
        <circle cx="187" cy="480" r="65" fill="url(#ckLolly)"/>
        <circle cx="187" cy="480" r="45" fill="none" stroke="#ffffff" stroke-width="8"/>
        <circle cx="187" cy="480" r="25" fill="none" stroke="#ffffff" stroke-width="6"/>

        <!-- סוכריה ימנית -->
        <rect x="1240" y="450" width="14" height="260" fill="#fff" rx="6"/>
        <circle cx="1247" cy="450" r="75" fill="#7209b7"/>
        <path d="M1247 375 A75 75 0 0 1 1247 525 A75 75 0 0 0 1247 375" fill="#f72585"/>
        <path d="M1247 405 A45 45 0 0 1 1247 495 A45 45 0 0 0 1247 405" fill="#ffe66d"/>
      </svg>
    `,
    charms: {
      gummyBear: `<svg viewBox="0 0 100 100"><defs><radialGradient id="gbGlow" cx="35%" cy="35%" r="60%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="40%" stop-color="#ff4d6d"/><stop offset="100%" stop-color="#800f2f"/></radialGradient></defs><circle cx="34" cy="30" r="9" fill="url(#gbGlow)"/><circle cx="66" cy="30" r="9" fill="url(#gbGlow)"/><ellipse cx="50" cy="44" rx="20" ry="17" fill="url(#gbGlow)"/><ellipse cx="50" cy="68" rx="24" ry="22" fill="url(#gbGlow)"/><ellipse cx="26" cy="58" rx="7" ry="12" fill="url(#gbGlow)"/><ellipse cx="74" cy="58" rx="7" ry="12" fill="url(#gbGlow)"/><ellipse cx="36" cy="88" rx="8" ry="10" fill="url(#gbGlow)"/><ellipse cx="64" cy="88" rx="8" ry="10" fill="url(#gbGlow)"/><circle cx="44" cy="42" r="2.5" fill="#4a0010"/><circle cx="56" cy="42" r="2.5" fill="#4a0010"/><ellipse cx="50" cy="48" rx="4" ry="3" fill="#fff" opacity="0.6"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      donut: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="54" rx="36" ry="32" fill="#e7c18a"/><path d="M20 50 C20 30 80 30 80 50 C74 54 68 46 60 52 C52 58 48 48 40 52 C32 56 26 48 20 50 Z" fill="#ff4d6d"/><ellipse cx="50" cy="52" rx="12" ry="10" fill="#fff"/><circle cx="35" cy="42" r="2" fill="#ffe66d"/><circle cx="62" cy="40" r="2" fill="#4cc9f0"/><circle cx="48" cy="35" r="2" fill="#ffffff"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      lollipop: `<svg viewBox="0 0 100 100"><circle cx="50" cy="46" r="30" fill="#ff4d6d" stroke="#fff" stroke-width="2"/><path d="M50 46 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0" fill="none" stroke="#ffe66d" stroke-width="4"/><path d="M50 46 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0" fill="none" stroke="#4cc9f0" stroke-width="4"/><line x1="50" y1="76" x2="50" y2="94" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      cupcake: `<svg viewBox="0 0 100 100"><path d="M30 60 L36 90 L64 90 L70 60 Z" fill="#d4a373" stroke="#fff" stroke-width="1.5"/><path d="M24 60 C24 45 40 40 50 35 C60 40 76 45 76 60 Z" fill="#ff758f"/><circle cx="50" cy="32" r="8" fill="#e63946"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      candyBonbon: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="54" rx="22" ry="18" fill="#f72585" stroke="#fff" stroke-width="2"/><polygon points="28,54 14,40 14,68" fill="#ffd166"/><polygon points="72,54 86,40 86,68" fill="#ffd166"/><line x1="38" y1="42" x2="44" y2="66" stroke="#fff" stroke-width="2"/><line x1="48" y1="40" x2="54" y2="68" stroke="#fff" stroke-width="2"/><line x1="58" y1="42" x2="64" y2="66" stroke="#fff" stroke-width="2"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      iceCream: `<svg viewBox="0 0 100 100"><polygon points="32,56 50,92 68,56" fill="#e09f3e"/><circle cx="50" cy="46" r="18" fill="#4cc9f0"/><circle cx="42" cy="36" r="14" fill="#ff758f"/><circle cx="50" cy="22" r="6" fill="#e63946"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`
    }
  },

  starlightCosmic: {
    id: 'starlightCosmic',
    name: 'גלקסיה וחלום כוכבים',
    nameEn: 'Starlight Cosmic',
    icon: '🪐',
    colors: {
      background: '#0a0b1e',
      primary: '#1a1c4b',
      accent: '#4cc9f0',
      surface: 'rgba(15, 18, 50, 0.8)',
      surfaceBorder: '#4361ee',
      thread: '#7209b7',
      text: '#e0e1dd',
      beadPalette: ['#4cc9f0', '#4895ef', '#4361ee', '#3f37c9', '#7209b7', '#f72585', '#ffd166', '#ffffff']
    },
    backgroundSvg: `
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="theme-bg-svg">
        <defs>
          <linearGradient id="scSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#050510"/>
            <stop offset="50%" stop-color="#0d1137"/>
            <stop offset="100%" stop-color="#1f1035"/>
          </linearGradient>
          <radialGradient id="scNebula" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#7209b7" stop-opacity="0.5"/>
            <stop offset="50%" stop-color="#4361ee" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#050510" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#scSky)"/>
        
        <!-- עננת ערפילית סגולה כחולה -->
        <circle cx="400" cy="300" r="350" fill="url(#scNebula)"/>
        <circle cx="1100" cy="600" r="400" fill="url(#scNebula)"/>
        
        <!-- כוכבים מנצנצים -->
        <g fill="#ffffff">
          <circle cx="120" cy="80" r="2"/>
          <circle cx="320" cy="140" r="1.5"/>
          <circle cx="650" cy="90" r="3"/>
          <circle cx="850" cy="220" r="2"/>
          <circle cx="1300" cy="100" r="2.5"/>
          <circle cx="1380" cy="320" r="1.5"/>
          <circle cx="90" cy="500" r="2"/>
          <circle cx="220" cy="740" r="3"/>
          <circle cx="1020" cy="800" r="1.5"/>
        </g>
        
        <!-- פלנטת שבתאי עם טבעות -->
        <g transform="translate(1150, 200)">
          <ellipse cx="0" cy="0" rx="90" ry="24" fill="none" stroke="#4cc9f0" stroke-width="8" transform="rotate(-20)" opacity="0.85"/>
          <circle cx="0" cy="0" r="50" fill="#f72585"/>
          <ellipse cx="0" cy="0" rx="70" ry="18" fill="none" stroke="#ffe66d" stroke-width="4" transform="rotate(-20)"/>
        </g>
      </svg>
    `,
    charms: {
      planet: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="54" rx="44" ry="12" fill="none" stroke="#4cc9f0" stroke-width="4" transform="rotate(-20 50 54)"/><circle cx="50" cy="54" r="24" fill="#f72585"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      rocket: `<svg viewBox="0 0 100 100"><path d="M50 20 C65 35 65 65 65 72 L35 72 C35 65 35 35 50 20 Z" fill="#ffffff"/><polygon points="35,62 20,78 35,74" fill="#f72585"/><polygon points="65,62 80,78 65,74" fill="#f72585"/><circle cx="50" cy="45" r="7" fill="#4cc9f0"/><polygon points="45,72 50,88 55,72" fill="#ffd166"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      star: `<svg viewBox="0 0 100 100"><polygon points="50,18 58,38 78,38 62,50 68,70 50,58 32,70 38,50 22,38 42,38" fill="#ffd166" stroke="#fff" stroke-width="2"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      alienUfo: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="46" rx="16" ry="14" fill="#06d6a0"/><ellipse cx="50" cy="58" rx="36" ry="12" fill="#4cc9f0" stroke="#fff" stroke-width="1.5"/><circle cx="36" cy="58" r="3" fill="#ffd166"/><circle cx="50" cy="58" r="3" fill="#ffd166"/><circle cx="64" cy="58" r="3" fill="#ffd166"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      astronaut: `<svg viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="38" rx="14" fill="#ffffff"/><rect x="36" y="36" width="28" height="20" rx="8" fill="#ffd166"/><circle cx="50" cy="74" r="16" fill="#ffffff"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`,
      meteor: `<svg viewBox="0 0 100 100"><circle cx="40" cy="60" r="18" fill="#e76f51"/><polygon points="40,42 78,22 56,60" fill="#f4a261"/><circle cx="35" cy="55" r="3" fill="#264653"/><circle cx="46" cy="65" r="2.5" fill="#264653"/><circle cx="50" cy="10" r="4" fill="#ffd166"/></svg>`
    }
  },

  bohoStudio: {
    id: 'bohoStudio',
    name: 'סטודיו בוהו-שיק',
    nameEn: 'Boho Chic Studio',
    icon: '🪴',
    colors: {
      background: '#f4ece1',
      primary: '#c97a56',
      accent: '#819b88',
      surface: 'rgba(255, 255, 255, 0.85)',
      surfaceBorder: '#d8b192',
      thread: '#a86544',
      text: '#44362b',
      beadPalette: ['#c97a56', '#d8b192', '#819b88', '#b5c4b1', '#e3a857', '#6b5344', '#f7ede2', '#d5896f']
    },
    backgroundSvg: `
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="theme-bg-svg">
        <defs>
          <linearGradient id="bsWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#faf5ee"/>
            <stop offset="100%" stop-color="#ece0d1"/>
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#bsWall)"/>
        
        <!-- קשת בוהו גיאומטרית ברקע (Arch) -->
        <path d="M150 900 L150 450 A180 180 0 0 1 510 450 L510 900 Z" fill="#eddcd2" opacity="0.6"/>
        <circle cx="330" cy="380" r="70" fill="#ddb892" opacity="0.4"/>

        <!-- עציץ מונסטרה מודרני בפינה ימנית -->
        <g transform="translate(1120, 520)">
          <!-- כד טרקוטה -->
          <path d="M80 240 L160 240 L180 380 L60 380 Z" fill="#b07d62"/>
          <ellipse cx="120" cy="240" rx="40" ry="12" fill="#9c6644"/>
          <!-- עלי מונסטרה -->
          <path d="M120 240 Q100 120 40 60 C80 90 110 160 120 240 Z" fill="#606c38"/>
          <path d="M120 240 Q160 100 220 40 C190 90 160 160 120 240 Z" fill="#606c38"/>
          <path d="M120 240 Q130 80 130 0 C145 70 140 160 120 240 Z" fill="#283618"/>
        </g>
      </svg>
    `,
    charms: {
      monstera: `<svg viewBox="0 0 100 100"><path d="M50 88 C25 70 20 40 50 18 C80 40 75 70 50 88 Z" fill="#606c38" stroke="#fefae0" stroke-width="1.5"/><line x1="50" y1="18" x2="50" y2="88" stroke="#fefae0" stroke-width="2"/><circle cx="50" cy="10" r="4" fill="#c97a56"/></svg>`,
      bohoEye: `<svg viewBox="0 0 100 100"><path d="M18 52 Q50 20 82 52 Q50 84 18 52 Z" fill="#fefae0" stroke="#6b5344" stroke-width="2"/><circle cx="50" cy="52" r="14" fill="#457b9d"/><circle cx="50" cy="52" r="6" fill="#1d3557"/><circle cx="50" cy="10" r="4" fill="#c97a56"/></svg>`,
      vase: `<svg viewBox="0 0 100 100"><path d="M42 30 L58 30 L58 38 C68 46 72 65 64 78 C58 86 42 86 36 78 C28 65 32 46 42 38 Z" fill="#c97a56" stroke="#fff" stroke-width="1.5"/><ellipse cx="50" cy="30" rx="8" ry="3" fill="#9c6644"/><circle cx="50" cy="10" r="4" fill="#c97a56"/></svg>`,
      sunArch: `<svg viewBox="0 0 100 100"><path d="M30 68 A20 20 0 0 1 70 68 Z" fill="#e09f3e"/><line x1="50" y1="42" x2="50" y2="34" stroke="#e09f3e" stroke-width="3"/><line x1="36" y1="48" x2="30" y2="42" stroke="#e09f3e" stroke-width="3"/><line x1="64" y1="48" x2="70" y2="42" stroke="#e09f3e" stroke-width="3"/><circle cx="50" cy="10" r="4" fill="#c97a56"/></svg>`,
      tassel: `<svg viewBox="0 0 100 100"><circle cx="50" cy="34" r="8" fill="#d4a373"/><path d="M42 42 L34 88 L66 88 L58 42 Z" fill="#c97a56"/><rect x="40" y="44" width="20" height="4" fill="#6b5344"/><circle cx="50" cy="10" r="4" fill="#c97a56"/></svg>`,
      woodRing: `<svg viewBox="0 0 100 100"><circle cx="50" cy="54" r="28" fill="none" stroke="#b07d62" stroke-width="10"/><circle cx="50" cy="54" r="20" fill="none" stroke="#7f4f24" stroke-width="2"/><circle cx="50" cy="10" r="4" fill="#c97a56"/></svg>`
    }
  }
};

export function getThemePack(themeId: ThemeId): ThemePack {
  const packId = THEME_ID_TO_PACK[themeId];
  return THEME_PACKS[packId] ?? THEME_PACKS.bohoStudio;
}

export function getThemePackByPackId(packId: string): ThemePack | undefined {
  if (packId in THEME_PACKS) return THEME_PACKS[packId as ThemePackId];
  return undefined;
}

/** מחיל משתני CSS של החבילה על המסמך */
export function applyThemePackCss(theme: ThemePack): void {
  const root = document.documentElement;
  root.style.setProperty('--bg-main', theme.colors.background);
  root.style.setProperty('--primary-color', theme.colors.primary);
  root.style.setProperty('--accent-color', theme.colors.accent);
  root.style.setProperty('--surface-bg', theme.colors.surface);
  root.style.setProperty('--surface-border', theme.colors.surfaceBorder);
  root.style.setProperty('--thread-color', theme.colors.thread);
  root.style.setProperty('--text-main', theme.colors.text);
  /* תאימות למנוע הקיים */
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--tray-bg', theme.colors.surface);
  root.style.setProperty('--tray-border', theme.colors.surfaceBorder);
  root.style.setProperty('--glass-bg', theme.colors.surface);
  root.style.setProperty('--glass-border', theme.colors.surfaceBorder);
  root.style.setProperty('--ink', theme.colors.text);
  root.style.setProperty('--coral', theme.colors.accent);
  root.style.setProperty('--sea', theme.colors.primary);
  root.style.setProperty('--paper-deep', theme.colors.background);
}

/**
 * מנהל העיצוב להחלפה דינמית של הרקעים, הצבעים ומגשי החרוזים
 */
export class ThemeManager {
  currentTheme: ThemePack;

  constructor(initialThemeId: ThemePackId | ThemeId = 'fairyForest') {
    const pack =
      getThemePackByPackId(initialThemeId) ??
      (initialThemeId in THEME_ID_TO_PACK
        ? getThemePack(initialThemeId as ThemeId)
        : THEME_PACKS.fairyForest);
    this.currentTheme = pack;
  }

  setTheme(themeId: ThemePackId | ThemeId): void {
    const pack =
      getThemePackByPackId(themeId) ??
      (themeId in THEME_ID_TO_PACK ? getThemePack(themeId as ThemeId) : undefined);
    if (!pack) return;
    this.currentTheme = pack;
    this.applyToDOM();
  }

  applyToDOM(): void {
    const theme = this.currentTheme;
    applyThemePackCss(theme);

    // אם React מנהל את #game-background-layer — לא דורסים את ה־innerHTML
    const bgContainer = document.getElementById('game-background-layer');
    if (bgContainer?.dataset.reactOwned === '1') {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
      return;
    }

    let layer = bgContainer;
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'game-background-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.prepend(layer);
    }
    layer.innerHTML = theme.backgroundSvg;

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }
}

/** מופע יחיד לשימוש באפליקציה */
export const themeManager = new ThemeManager('bohoStudio');
