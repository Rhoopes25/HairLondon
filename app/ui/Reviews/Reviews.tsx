import type { ReactNode } from 'react';
import { RatingLine, Stars } from '../Stars';
import styles from './Reviews.module.css';

export interface ReviewView {
  id: string;
  name: string;
  stars: number;
  text: string;
}

export interface ReviewsProps {
  reviews: readonly ReviewView[];
  average: number | null;
  /** e.g. a "Write a review" link. */
  action?: ReactNode;
}

/** Reviews in a bordered card: a plain rating line, then each client's words. */
export function Reviews({ reviews, average, action }: ReviewsProps) {
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
        {reviews.map((review) => (
          <li key={review.id} className={styles.review}>
            <div className={styles.top}>
              <strong>{review.name}</strong>
              <Stars stars={review.stars} />
            </div>
            <p>{review.text}</p>
          </li>
        ))}
      </ul>
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
