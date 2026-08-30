import { useState } from 'react';
import { playSharePop } from '../lib/craftSounds';
import {
  downloadJewelryOnly,
  shareOrDownloadJewelry,
  type JewelryExportInput,
} from '../lib/exportJewelry';

/**
 * שמירת תמונה + שיתוף מערכת (Web Share API) עם נפילה להורדה.
 */
export function ExportShareButtons({
  input,
  compact = false,
  onDone,
}: {
  input: JewelryExportInput;
  compact?: boolean;
  onDone?: (result: 'shared' | 'downloaded') => void;
}) {
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);

  const run = async (mode: 'share' | 'save') => {
    if (busy) return;
    setBusy(mode);
    try {
      playSharePop();
      if (mode === 'save') {
        await downloadJewelryOnly(input);
        onDone?.('downloaded');
      } else {
        const result = await shareOrDownloadJewelry(input);
        onDone?.(result);
      }
    } catch {
      onDone?.('downloaded');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`export-share${compact ? ' export-share--compact' : ''}`}>
      <button
        type="button"
        className="export-share-btn export-share-btn--primary"
        disabled={busy != null || input.beads.length === 0}
        onClick={() => void run('share')}
      >
        {busy === 'share' ? 'מכינים…' : compact ? 'שתפו 📤' : 'שתפו תמונה 📤'}
      </button>
      <button
        type="button"
        className="export-share-btn"
        disabled={busy != null || input.beads.length === 0}
        onClick={() => void run('save')}
      >
        {busy === 'save' ? 'שומרים…' : compact ? 'שמירה 🖼️' : 'שמירת תמונה 🖼️'}
      </button>
    </div>
  );
}
