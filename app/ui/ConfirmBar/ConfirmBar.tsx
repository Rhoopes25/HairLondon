import type { ReactNode } from 'react';
import { cx } from '@app/lib/cx';
import styles from './ConfirmBar.module.css';

export interface ConfirmBarProps {
  /** One quiet line describing the choice so far. */
  summary?: string;
  total?: { label?: string; value: string };
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
export function ConfirmBar({ summary, total, sticky, children }: ConfirmBarProps) {
  return (
    <div className={cx(styles.bar, sticky && styles.sticky)}>
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
