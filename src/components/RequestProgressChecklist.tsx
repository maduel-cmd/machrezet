import { CATEGORY_LABELS } from '../data/beads';
import {
  buildRequestChecklist,
  checklistSummary,
  type ChecklistItem,
  type ChecklistStatus,
} from '../lib/requestProgress';
import type { PlacedBead, RequestRules } from '../lib/types';

const STATUS_ICON: Record<ChecklistStatus, string> = {
  done: '✓',
  partial: '◐',
  todo: '○',
  warn: '!',
};

const STATUS_LABEL: Record<ChecklistStatus, string> = {
  done: 'הושלם',
  partial: 'חלקי',
  todo: 'ממתין',
  warn: 'שימו לב',
};

type Props = {
  beads: PlacedBead[];
  rules: RequestRules;
};

/** צ׳ק־ליסט התקדמות חי לאתגר בקשה — תצוגה בלבד, לא משנה ניקוד */
export function RequestProgressChecklist({ beads, rules }: Props) {
  const items = buildRequestChecklist(beads, rules);
  const { done, total } = checklistSummary(items);
  if (total === 0) return null;

  const ratio = total === 0 ? 0 : done / total;

  return (
    <aside className="request-checklist" aria-live="polite">
      <header className="request-checklist-head">
        <div>
          <p className="request-checklist-kicker">התקדמות לבקשה</p>
          <h2 className="request-checklist-title">
            {done}/{total} הושלמו
          </h2>
        </div>
        <div
          className="request-checklist-meter"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`הושלמו ${done} מתוך ${total}`}
        >
          <span className="request-checklist-meter-fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
      </header>

      <ul className="request-checklist-list">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </ul>

      {rules.preferredColors?.length ? (
        <p className="request-checklist-hint muted">
          טיפ: נסו גוונים שמתאימים לבקשה
          {rules.requiredCategories?.length
            ? ` · סוגי מפתח: ${rules.requiredCategories.map((c) => CATEGORY_LABELS[c]).join(', ')}`
            : ''}
        </p>
      ) : null}
    </aside>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  return (
    <li className={`request-check request-check--${item.status}`}>
      <span className="request-check-mark" aria-hidden>
        {STATUS_ICON[item.status]}
      </span>
      <span className="request-check-body">
        <span className="request-check-label">{item.label}</span>
        {item.detail ? <span className="request-check-detail">{item.detail}</span> : null}
      </span>
      <span className="request-check-status sr-only">{STATUS_LABEL[item.status]}</span>
    </li>
  );
}
