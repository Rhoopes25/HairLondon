import type { ReactNode } from 'react';
import styles from './Notice.module.css';

/**
 * A calm "nothing matched, here is what we can do instead" box. It is announced politely, so a
 * screen reader hears the change after a filter without the focus being pulled away.
 */
export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.notice} role="status">
      <p className={styles.title}>{title}</p>
      <p className={styles.text}>{children}</p>
    </div>
  );
}
