import { cx } from '@app/lib/cx';
import styles from './RunningTotal.module.css';

export interface RunningTotalProps {
  /** "$120–145+" or "$185+". Always a starting price, so it always carries a plus. */
  price: string;
  /** "about 3 hr". */
  duration: string;
  /** Small print under both, e.g. that each stylist sets her own price. */
  note?: string;
  /** Stay in view at the bottom of the screen while she keeps choosing. */
  sticky?: boolean;
}

/**
 * What the visit adds up to so far: the price and how long it takes, updated as she picks services.
 * It is announced politely when it changes, so a screen reader hears the new total without
 * the focus being pulled away from what she is doing.
 */
export function RunningTotal({ price, duration, note, sticky = true }: RunningTotalProps) {
  return (
    <div className={cx(styles.bar, sticky && styles.sticky)} role="status">
      <dl className={styles.figures}>
        <div className={styles.figure}>
          <dt>Estimated total</dt>
          <dd className={styles.price}>{price}</dd>
        </div>
        <div className={styles.figure}>
          <dt>Total time</dt>
          <dd className={styles.time}>{duration}</dd>
        </div>
      </dl>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}
