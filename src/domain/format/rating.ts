import type { Review } from '../models/review';

/** Average star rating, or null when there are no reviews yet. */
export function averageRating(reviews: readonly Pick<Review, 'stars'>[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length;
}

/** 4.666 -> "4.7" */
export function formatRating(average: number): string {
  return average.toFixed(1);
}

/** 1 -> "1 review", 3 -> "3 reviews" */
export function reviewCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'review' : 'reviews'}`;
}

/** 4 -> "★★★★☆" */
export function starsText(stars: number): string {
  const full = Math.max(0, Math.min(5, Math.round(stars)));
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
