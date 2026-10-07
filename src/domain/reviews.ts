import type { Review } from './models/review';
import type { Stylist } from './models/stylist';

/** A review a client wrote in the app. */
export interface UserReview extends Review {
  readonly stylistId: string;
  readonly appointmentId: string;
}

export function isValidStars(stars: number): boolean {
  return Number.isInteger(stars) && stars >= 1 && stars <= 5;
}

/** A stylist with the reviews clients wrote in the app added after her sample reviews. */
export function withUserReviews(stylist: Stylist, userReviews: readonly UserReview[]): Stylist {
  const mine = userReviews.filter((review) => review.stylistId === stylist.id);
  return mine.length
    ? { ...stylist, reviews: [...mine.slice().reverse(), ...stylist.reviews] }
    : stylist;
}
