/**
 * ניהול עדכוני PWA לאופליין — Service Worker.
 * כשיש גרסה חדשה באונליין: מורידים ומחילים על המטמון המקומי.
 */

type UpdateHandler = (reloadPage?: boolean) => Promise<void>;

export type PwaUpdateState = {
  /** יש גרסה חדשה מוכנה להחלה */
  needRefresh: boolean;
  /** האפליקציה מוכנה לעבודה לא מקוונת */
  offlineReady: boolean;
  /** נרשם Service Worker */
  registered: boolean;
};

type Listener = (state: PwaUpdateState) => void;

let updateSW: UpdateHandler | undefined;
let registration: ServiceWorkerRegistration | null = null;
let state: PwaUpdateState = {
  needRefresh: false,
  offlineReady: false,
  registered: false,
};
const listeners = new Set<Listener>();

function emit() {
  const snapshot = { ...state };
  for (const listener of listeners) listener(snapshot);
}

export function getPwaUpdateState(): PwaUpdateState {
  return { ...state };
}

export function subscribePwaUpdate(listener: Listener): () => void {
  listeners.add(listener);
  listener(getPwaUpdateState());
  return () => {
    listeners.delete(listener);
  };
}

/** קריאה חד־פעמית מ־main.tsx אחרי ייבוא virtual:pwa-register */
export function bindPwaRegister(register: typeof import('virtual:pwa-register').registerSW) {
  if (typeof window === 'undefined') return;

  updateSW = register({
    immediate: true,
    onNeedRefresh() {
      state = { ...state, needRefresh: true };
      emit();
    },
    onOfflineReady() {
      state = { ...state, offlineReady: true };
      emit();
    },
    onRegisteredSW(_swUrl, reg) {
      registration = reg ?? null;
      state = { ...state, registered: Boolean(reg) };
      emit();
    },
    onRegisterError(error) {
      console.warn('[pwa] register failed', error);
    },
  });
}

/** בדיקה מול השרת — דורש אינטרנט */
export async function checkForPwaUpdate(): Promise<'offline' | 'checking' | 'updated' | 'current' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }
  if (!navigator.onLine) return 'offline';

  const reg = registration ?? (await navigator.serviceWorker.getRegistration());
  if (!reg) return 'unsupported';

  const prevWaiting = reg.waiting;
  await reg.update();

  // אם כבר היה waiting, או onNeedRefresh יקפוץ — נחכה רגע קצר
  await new Promise((r) => window.setTimeout(r, 400));

  if (state.needRefresh || reg.waiting) {
    state = { ...state, needRefresh: true };
    emit();
    return 'updated';
  }

  // אם installing → waiting בקרוב
  if (reg.installing) {
    return await new Promise((resolve) => {
      const sw = reg.installing;
      if (!sw) {
        resolve(prevWaiting ? 'updated' : 'current');
        return;
      }
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          state = { ...state, needRefresh: true };
          emit();
          resolve('updated');
        } else if (sw.state === 'activated' || sw.state === 'redundant') {
          resolve(state.needRefresh ? 'updated' : 'current');
        }
      });
      window.setTimeout(() => resolve(state.needRefresh ? 'updated' : 'current'), 8000);
    });
  }

  return 'current';
}

/** הורדה/החלה של העדכון על המטמון האופליין + רענון */
export async function applyPwaUpdate(): Promise<boolean> {
  if (!updateSW) return false;
  state = { ...state, needRefresh: false };
  emit();
  await updateSW(true);
  return true;
}
