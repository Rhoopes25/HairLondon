import type { ReactNode } from 'react';
import styles from './ConfirmBar.module.css';

export interface ConfirmBarProps {
  /** One quiet line describing the choice so far. */
  summary?: string;
  total?: { label?: string; value: string };
  /** The action buttons. */
  children: ReactNode;
}

/** The white panel at the bottom of a step: what you chose, the total, and the next action. */
export function ConfirmBar({ summary, total, children }: ConfirmBarProps) {
  return (
    <div className={styles.bar}>
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
      {children}
    </div>
  );
}
