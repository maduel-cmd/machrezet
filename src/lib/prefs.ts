import { DEFAULT_THEME_ID, isThemeId, type ThemeId } from './themes';

export const PREFS_STORAGE_KEY = 'machrezet-prefs-v1';

export type AppPrefs = {
  themeId: ThemeId;
  soundMuted: boolean;
};

const DEFAULT_PREFS: AppPrefs = {
  themeId: DEFAULT_THEME_ID,
  soundMuted: false,
};

export function loadPrefs(): AppPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      themeId: isThemeId(o.themeId) ? o.themeId : DEFAULT_THEME_ID,
      soundMuted: Boolean(o.soundMuted),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(next: AppPrefs): AppPrefs {
  const prefs: AppPrefs = {
    themeId: isThemeId(next.themeId) ? next.themeId : DEFAULT_THEME_ID,
    soundMuted: Boolean(next.soundMuted),
  };
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode */
  }
  return prefs;
}
