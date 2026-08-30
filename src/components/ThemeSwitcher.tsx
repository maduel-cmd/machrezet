import { useEffect, useId, useState } from 'react';
import { isSoundMuted, setSoundMuted } from '../lib/craftSounds';
import { themeManager } from '../lib/machrezetThemeGraphics';
import { loadPrefs, savePrefs } from '../lib/prefs';
import { THEMES, type ThemeId } from '../lib/themes';

/**
 * בורר עולמות + השתקת צלילים — נשמר במכשיר.
 * בחירה מפעילה themeManager.setTheme(themeId).
 */
export function ThemeSwitcher({
  themeId,
  onThemeChange,
  soundMuted,
  onSoundMutedChange,
}: {
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  soundMuted: boolean;
  onSoundMutedChange: (muted: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const current = THEMES.find((t) => t.id === themeId) ?? THEMES[0]!;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="theme-switcher">
      <button
        type="button"
        className="theme-chip"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        title="בחירת עולם"
      >
        <span aria-hidden>{current.emoji}</span>
        <span className="theme-chip-label">{current.nameHe}</span>
      </button>

      {open ? (
        <div
          className="theme-modal-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="theme-modal glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="theme-modal-header">
              <h2 id={titleId}>בחרו עולם ✨</h2>
              <button type="button" className="ghost-btn" onClick={() => setOpen(false)} aria-label="סגירה">
                ✕
              </button>
            </header>

            <ul className="theme-grid">
              {THEMES.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`theme-card theme-card--${t.id}${themeId === t.id ? ' is-active' : ''}`}
                    aria-pressed={themeId === t.id}
                    onClick={() => {
                      themeManager.setTheme(t.id);
                      onThemeChange(t.id);
                      setOpen(false);
                    }}
                  >
                    <span className="theme-card-emoji" aria-hidden>
                      {t.emoji}
                    </span>
                    <strong>{t.nameHe}</strong>
                    <span>{t.blurbHe}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="theme-sound-row">
              <button
                type="button"
                className={`sound-toggle${soundMuted ? ' is-muted' : ''}`}
                aria-pressed={!soundMuted}
                onClick={() => onSoundMutedChange(!soundMuted)}
              >
                {soundMuted ? '🔇 צלילים כבויים' : '🔊 צלילים דלוקים'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** סנכרון העדפות מהאחסון המקומי (לשימוש ב־App) */
export function useSyncedPrefs() {
  const [prefs, setPrefs] = useState(() => loadPrefs());

  useEffect(() => {
    setSoundMuted(prefs.soundMuted);
    document.documentElement.dataset.theme = prefs.themeId;
    themeManager.setTheme(prefs.themeId);
  }, [prefs]);

  const setThemeId = (themeId: ThemeId) => {
    themeManager.setTheme(themeId);
    setPrefs((p) => savePrefs({ ...p, themeId }));
  };

  const setMuted = (soundMuted: boolean) => {
    setSoundMuted(soundMuted);
    setPrefs((p) => savePrefs({ ...p, soundMuted }));
  };

  return {
    themeId: prefs.themeId,
    soundMuted: prefs.soundMuted || isSoundMuted(),
    setThemeId,
    setMuted,
  };
}
