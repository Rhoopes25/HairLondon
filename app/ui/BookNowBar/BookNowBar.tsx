import { LinkButton } from '../Button';
import styles from './BookNowBar.module.css';

export interface BookNowBarProps {
  /** Where booking starts: the Book page, or one stylist's booking on her own pages. */
  to: string;
  /** "Book Now" everywhere; "Book Now with London" on her own pages. */
  label?: string;
}

/**
 * The first thing on a main page: one large Book Now, so there is never a hunt for the way in.
 * Booking is the thing most people came to do, so it sits at the top instead of waiting for them
 * to scroll. Home has its own in the hero, and the Book page is already booking, so neither uses this.
 */
export function BookNowBar({ to, label = 'Book Now' }: BookNowBarProps) {
  return (
    <div className={styles.bar}>
      <LinkButton to={to} size="lg" fullWidth>
        {label}
      </LinkButton>
    </div>
  );
}
