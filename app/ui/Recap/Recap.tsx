import type { ReactNode } from 'react';
import styles from './Recap.module.css';

export interface RecapRow {
  label: string;
  value: ReactNode;
}

/** Label/value rows summarizing a booking. */
export function Recap({ rows }: { rows: readonly RecapRow[] }) {
  return (
    <dl className={styles.recap}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
