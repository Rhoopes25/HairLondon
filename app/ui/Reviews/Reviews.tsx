import { useState } from 'react';
import type { ReactNode } from 'react';
import { formatMonthYear } from '@src/domain/format/date';
import { Button } from '../Button';
import { RatingLine, Stars } from '../Stars';
import styles from './Reviews.module.css';

export interface ReviewView {
  id: string;
  name: string;
  stars: number;
  text: string;
  /** yyyy-mm-dd. Shown as a month and year; reviews saved before dates existed have none. */
  date?: string;
}

/** How many reviews show at first, and how many more each tap adds. Fifty at once is a wall. */
const FIRST_PAGE = 8;
const NEXT_PAGE = 10;

export interface ReviewsProps {
  reviews: readonly ReviewView[];
  average: number | null;
  /** e.g. a "Write a review" link. */
  action?: ReactNode;
  /** Defaults to 8. */
  firstPage?: number;
}

/**
 * Reviews in a bordered card: a plain rating line, then each client's words, newest first. With
 * dozens of them, it shows a first page and offers more, so the card never becomes a wall.
 */
export function Reviews({ reviews, average, action, firstPage = FIRST_PAGE }: ReviewsProps) {
  const [shown, setShown] = useState(firstPage);
  const visible = reviews.slice(0, shown);
  const remaining = reviews.length - visible.length;

  return (
    <section className={styles.card} aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className={styles.heading}>
        Reviews
      </h2>
      <p className={styles.summary}>
        <RatingLine average={average} count={reviews.length} />
      </p>
      {reviews.length === 0 ? <p className={styles.empty}>No reviews yet.</p> : null}
      <ul className={styles.list}>
        {visible.map((review) => {
          const when = formatMonthYear(review.date);
          return (
            <li key={review.id} className={styles.review}>
              <div className={styles.top}>
                <span className={styles.who}>
                  <strong>{review.name}</strong>
                  {when ? <span className={styles.date}>{when}</span> : null}
                </span>
                <Stars stars={review.stars} />
              </div>
              <p>{review.text}</p>
            </li>
          );
        })}
      </ul>
      {remaining > 0 ? (
        <div className={styles.more}>
          <p className={styles.showing} aria-live="polite">
            Showing {visible.length} of {reviews.length} reviews
          </p>
          <Button variant="outline" onClick={() => setShown(shown + NEXT_PAGE)}>
            Show {Math.min(NEXT_PAGE, remaining)} more reviews
          </Button>
        </div>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
