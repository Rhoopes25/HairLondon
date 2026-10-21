import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import styles from './Recap.module.css';

export interface RecapRow {
  label: string;
  value: ReactNode;
  /** A small line icon before the label, so the rows can be scanned at a glance. */
  icon?: IconName;
}

/** Label/value rows summarizing a booking. */
export function Recap({ rows }: { rows: readonly RecapRow[] }) {
  return (
    <dl className={styles.recap}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <dt>
            {row.icon ? <Icon name={row.icon} className={styles.icon} /> : null}
            {row.label}
          </dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
