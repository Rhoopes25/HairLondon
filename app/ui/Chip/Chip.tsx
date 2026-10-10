import { useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@app/lib/cx';
import styles from './Chip.module.css';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected: boolean;
  children: ReactNode;
}

/** A toggle button (filter). Selected state is exposed with aria-pressed, never color alone. */
export function Chip({ selected, className, type = 'button', children, ...rest }: ChipProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Keep the chosen chip in view in the horizontally scrolling row.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, [selected]);

  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.chip, selected && styles.selected, className)}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A horizontally scrolling row of chips. */
export function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row} role="group" aria-label={label}>
      {children}
    </div>
  );
}
