import { useEffect, useState } from 'react';
import {
  applyPwaUpdate,
  checkForPwaUpdate,
  subscribePwaUpdate,
  type PwaUpdateState,
} from '../lib/pwaUpdate';

type StatusMsg =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'offline' }
  | { kind: 'current' }
  | { kind: 'ready' }
  | { kind: 'applying' }
  | { kind: 'error'; text: string };

/**
 * כפתור עדכון אופליין — בודק באונליין, מוריד ומחיל על המטמון המקומי.
 */
export function OfflineUpdateButton({ className = '' }: { className?: string }) {
  const [pwa, setPwa] = useState<PwaUpdateState>({
    needRefresh: false,
    offlineReady: false,
    registered: false,
  });
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [status, setStatus] = useState<StatusMsg>({ kind: 'idle' });

  useEffect(() => subscribePwaUpdate(setPwa), []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // כשיש עדכון מוכן — הדגשה אוטומטית
  useEffect(() => {
    if (pwa.needRefresh) setStatus({ kind: 'ready' });
  }, [pwa.needRefresh]);

  // בדיקה שקטה כשחוזרים לאונליין / לפוקוס
  useEffect(() => {
    const quietCheck = () => {
      if (!navigator.onLine) return;
      void checkForPwaUpdate();
    };
    window.addEventListener('focus', quietCheck);
    window.addEventListener('online', quietCheck);
    return () => {
      window.removeEventListener('focus', quietCheck);
      window.removeEventListener('online', quietCheck);
    };
  }, []);

  const onCheck = async () => {
    if (!navigator.onLine) {
      setStatus({ kind: 'offline' });
      return;
    }
    setStatus({ kind: 'checking' });
    try {
      const result = await checkForPwaUpdate();
      if (result === 'offline') setStatus({ kind: 'offline' });
      else if (result === 'updated') setStatus({ kind: 'ready' });
      else if (result === 'unsupported') setStatus({ kind: 'error', text: 'עדכונים לא נתמכים בדפדפן הזה' });
      else setStatus({ kind: 'current' });
    } catch {
      setStatus({ kind: 'error', text: 'לא הצלחנו לבדוק עדכונים — נסו שוב' });
    }
  };

  const onApply = async () => {
    setStatus({ kind: 'applying' });
    try {
      const ok = await applyPwaUpdate();
      if (!ok) setStatus({ kind: 'error', text: 'לא הצלחנו להחיל את העדכון' });
      // reload קורה דרך updateSW(true)
    } catch {
      setStatus({ kind: 'error', text: 'שגיאה בהחלת העדכון' });
    }
  };

  const waiting = pwa.needRefresh || status.kind === 'ready';
  const busy = status.kind === 'checking' || status.kind === 'applying';

  return (
    <div className={`pwa-update ${waiting ? 'pwa-update--ready' : ''} ${className}`.trim()}>
      {waiting ? (
        <button type="button" className="pwa-update-btn pwa-update-btn--apply" onClick={() => void onApply()} disabled={busy}>
          <span className="pwa-update-icon" aria-hidden>
            ⬇️
          </span>
          <span className="pwa-update-copy">
            <strong>{status.kind === 'applying' ? 'מחילים עדכון…' : 'יש עדכון חדש! הורידו לאופליין'}</strong>
            <span className="pwa-update-sub">לחצו להחלה — יישמר גם בלי אינטרנט</span>
          </span>
        </button>
      ) : (
        <button type="button" className="pwa-update-btn" onClick={() => void onCheck()} disabled={busy || !online}>
          <span className="pwa-update-icon" aria-hidden>
            🔄
          </span>
          <span className="pwa-update-copy">
            <strong>{busy ? 'בודקים עדכונים…' : 'בדיקת עדכונים למשחק'}</strong>
            <span className="pwa-update-sub">
              {online ? 'כשיש אינטרנט — מורידים לשימוש לא מקוון' : 'צריך אינטרנט לבדיקת עדכונים'}
            </span>
          </span>
        </button>
      )}

      {status.kind === 'offline' ? (
        <p className="pwa-update-hint" role="status">
          אין אינטרנט כרגע — התחברו ואז בדקו שוב.
        </p>
      ) : null}
      {status.kind === 'current' ? (
        <p className="pwa-update-hint pwa-update-hint--ok" role="status">
          הגרסה מעודכנת · שמורה גם לאופליין
          {pwa.offlineReady ? ' ✓' : ''}
        </p>
      ) : null}
      {status.kind === 'error' ? (
        <p className="pwa-update-hint pwa-update-hint--err" role="alert">
          {status.text}
        </p>
      ) : null}
    </div>
  );
}
