import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)');
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq.matches || iosStandalone;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * באנר PWA עדין — התקנה / מצב אופליין.
 */
export function InstallAppButton({ className = '' }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandaloneDisplay());
  const [showIosTip, setShowIosTip] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowIosTip(false);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <div className={`pwa-banner pwa-banner--ready ${className}`.trim()} role="status">
        <span className="pwa-banner-icon" aria-hidden>
          ☁️
        </span>
        <p className="pwa-banner-text">המשחק במכשיר · זמין גם בלי אינטרנט</p>
      </div>
    );
  }

  const onClick = async () => {
    if (deferred) {
      setBusy(true);
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === 'accepted') {
          setInstalled(true);
          setDeferred(null);
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    if (isIos()) {
      setShowIosTip((v) => !v);
      return;
    }
    setShowIosTip(true);
  };

  return (
    <div className={`pwa-banner ${className}`.trim()}>
      <button type="button" className="pwa-banner-btn" onClick={() => void onClick()} disabled={busy}>
        <span className="pwa-banner-icon" aria-hidden>
          ☁️
        </span>
        <span className="pwa-banner-copy">
          <strong>{busy ? 'מתקינים…' : 'שחקו מכל מקום – גם בלי אינטרנט! 📱'}</strong>
          <span className="pwa-banner-sub">התקנה למסך הבית</span>
        </span>
      </button>
      {showIosTip ? (
        <p className="install-tip" role="note">
          {isIos()
            ? 'ב־Safari: לחצו על «שיתוף» ← «הוסף למסך הבית». אחר כך אפשר לפתוח בלי אינטרנט.'
            : deferred
              ? null
              : 'אם הכפתור לא פותח התקנה: בתפריט הדפדפן בחרו «התקנת אפליקציה» / «Install app».'}
        </p>
      ) : null}
    </div>
  );
}
