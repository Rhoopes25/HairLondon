import type { ReactNode } from 'react';
import { cx } from '@app/lib/cx';
import styles from './ConfirmBar.module.css';

export interface ConfirmBarProps {
  /** How far along the booking is: "Add your day", 33. Shown as a thin bar above the summary. */
  progress?: { label: string; percent: number };
  /** One quiet line describing the choice so far. */
  summary?: string;
  total?: { label?: string; value: string };
  /** Small print under the total, e.g. that the price is a starting price. */
  note?: string;
  /** On desktop, stay in view just under the header while the page scrolls past it. */
  sticky?: boolean;
  /** The action buttons. */
  children: ReactNode;
}

/**
 * The white panel at the end of a step: what you chose, the total, and the next action. On a phone
 * it is the last block of the page; from sm it is a bordered card, and when `sticky` it rides along
 * beside the content on desktop (booking puts it in a right-hand column).
 */
export function ConfirmBar({ progress, summary, total, note, sticky, children }: ConfirmBarProps) {
  return (
    <div className={cx(styles.bar, sticky && styles.sticky)}>
      {progress ? (
        <div className={styles.progress}>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="Booking progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            aria-valuetext={progress.label}
          >
            <span className={styles.fill} style={{ width: `${progress.percent}%` }} />
          </div>
          <div className={styles.progressLabel} aria-hidden="true">
            <span>{progress.label}</span>
            <span>{progress.percent}%</span>
          </div>
        </div>
      ) : null}
      {summary ? (
        <p className={styles.summary} aria-live="polite">
          {summary}
        </p>
      ) : null}
      {total ? (
        <p className={styles.total}>
          <span className={styles.totalLabel}>{total.label ?? 'Total'}</span>
          <strong>{total.value}</strong>
        </p>
      ) : null}
      {note ? <p className={styles.note}>{note}</p> : null}
      {children}
    </div>
  );
}
