import { LinkButton } from '../Button';
import styles from './BookBar.module.css';

export interface BookBarProps {
  /** What she has picked, or what the stylist offers: "Haircut + Color" or "Services from $65+". */
  title: string;
  /** One quiet line under it: "$185+ · about 3 hr" or "Pick services, a day, and a time next". */
  meta: string;
  /** A time she already chose, so the next screen opens with it held: "Thu, Oct 8 at 1:00 PM". */
  heldTime?: string | null;
  to: string;
  /** "Book with London". The one verb on the screen. */
  label: string;
}

/**
 * The one Book action on a profile, always in reach at the bottom of the screen so there is never
 * a hunt for it. It also says what the booking will start with.
 */
export function BookBar({ title, meta, heldTime, to, label }: BookBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
        {heldTime ? <span className={styles.held}>{heldTime}</span> : null}
      </div>
      <LinkButton to={to}>{label}</LinkButton>
    </div>
  );
}
