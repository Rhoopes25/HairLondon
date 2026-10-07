import { cx } from '@app/lib/cx';
import { formatRating, reviewCountLabel, starsText } from '@src/domain/format/rating';
import styles from './Stars.module.css';

export function Stars({ stars, className }: { stars: number; className?: string }) {
  const spoken = Number.isInteger(stars) ? String(stars) : formatRating(stars);
  return (
    <span
      className={cx(styles.stars, className)}
      role="img"
      aria-label={`${spoken} out of 5 stars`}
    >
      {starsText(stars)}
    </span>
  );
}

export interface RatingLineProps {
  /** Null when there are no reviews yet. */
  average: number | null;
  count: number;
  className?: string;
}

/** "★★★★★ 4.7 · 3 reviews", or "New" until the first review. Never invents a rating. */
export function RatingLine({ average, count, className }: RatingLineProps) {
  if (average === null) return <span className={cx(styles.line, className)}>New</span>;
  return (
    <span className={cx(styles.line, className)}>
      <Stars stars={average} />
      <span>
        {formatRating(average)} &middot; {reviewCountLabel(count)}
      </span>
    </span>
  );
}
