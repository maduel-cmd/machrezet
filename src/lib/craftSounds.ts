/**
 * צלילי קראפט — Web Audio API (ללא קבצי אודיו).
 */

let sharedCtx: AudioContext | null = null;
let muted = false;

export function setSoundMuted(next: boolean) {
  muted = next;
}

export function isSoundMuted() {
  return muted;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  return sharedCtx;
}

async function resume(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* ignore autoplay block */
    }
  }
}

function blip(
  freq: number,
  durationSec: number,
  type: OscillatorType,
  gainPeak: number,
  opts?: { slideTo?: number; noise?: boolean },
) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  void resume(ctx);

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  master.connect(ctx.destination);

  if (opts?.noise) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * Math.min(durationSec, 0.08)));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 1.4;
    src.connect(filter);
    filter.connect(master);
    src.start(now);
    src.stop(now + durationSec);
    return;
  }

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (opts?.slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.slideTo), now + durationSec * 0.85);
  }
  osc.connect(master);
  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

/** השחלת חרוז — קליק פלסטיק רך */
export function playBeadClack() {
  blip(420, 0.055, 'triangle', 0.11, { noise: true });
  blip(180, 0.04, 'sine', 0.05, { slideTo: 90 });
}

/** ביטול חרוז אחרון */
export function playUndoClack() {
  blip(260, 0.05, 'triangle', 0.08, { slideTo: 140, noise: true });
}

/** סיום / קשירה קצר */
export function playFinishChime() {
  blip(523, 0.09, 'sine', 0.09);
  window.setTimeout(() => blip(784, 0.12, 'sine', 0.07), 70);
  window.setTimeout(() => blip(1046, 0.16, 'triangle', 0.05), 150);
}

/** חגיגת סיום גדולה */
export function playCelebrateFanfare() {
  playFinishChime();
  window.setTimeout(() => blip(659, 0.1, 'sine', 0.07), 220);
  window.setTimeout(() => blip(880, 0.14, 'triangle', 0.08), 320);
  window.setTimeout(() => blip(1175, 0.2, 'sine', 0.06), 420);
  window.setTimeout(() => blip(1568, 0.18, 'triangle', 0.04), 520);
}

/** בחירת צבע חוט */
export function playCordTap() {
  blip(340, 0.04, 'sine', 0.05);
  blip(510, 0.05, 'triangle', 0.035, { slideTo: 420 });
}

/** פתיחת תיבת תכשיטים */
export function playBoxOpen() {
  blip(180, 0.08, 'triangle', 0.06, { noise: true });
  window.setTimeout(() => blip(480, 0.1, 'sine', 0.07), 50);
  window.setTimeout(() => blip(720, 0.12, 'triangle', 0.045), 120);
}

/** ניקוי חוט */
export function playClearWhoosh() {
  blip(140, 0.12, 'sawtooth', 0.04, { slideTo: 60, noise: true });
}

/** שיתוף / שמירת תמונה */
export function playSharePop() {
  blip(600, 0.06, 'sine', 0.06);
  window.setTimeout(() => blip(900, 0.08, 'triangle', 0.05), 60);
}
