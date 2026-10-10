import { isValidStars } from '../../domain/reviews';
import type { UserReview } from '../../domain/reviews';
import type { Clock } from '../../domain/clock';
import { JsonStore } from '../storage/json-store';
import type { StorageAdapter } from '../storage/storage-adapter';

export const REVIEWS_KEY = 'hbl:reviews:v1';

export interface NewReview {
  readonly stylistId: string;
  readonly appointmentId: string;
  readonly name: string;
  readonly stars: number;
  readonly text: string;
}

function isUserReview(raw: unknown): raw is UserReview {
  if (typeof raw !== 'object' || raw === null) return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.stylistId === 'string' &&
    typeof r.appointmentId === 'string' &&
    typeof r.name === 'string' &&
    typeof r.text === 'string' &&
    typeof r.stars === 'number' &&
    isValidStars(r.stars)
  );
}

function parseReviews(raw: unknown): readonly UserReview[] | null {
  return Array.isArray(raw) && raw.every(isUserReview) ? raw : null;
}

/** Reviews the client wrote in the app, oldest first. */
export class ReviewRepository {
  private readonly store: JsonStore<readonly UserReview[]>;
  readonly subscribe: JsonStore<readonly UserReview[]>['subscribe'];
  readonly getSnapshot: JsonStore<readonly UserReview[]>['getSnapshot'];

  constructor(
    storage: StorageAdapter,
    private readonly clock: Clock,
  ) {
    this.store = new JsonStore<readonly UserReview[]>(storage, REVIEWS_KEY, [], parseReviews);
    this.subscribe = this.store.subscribe;
    this.getSnapshot = this.store.getSnapshot;
  }

  hasReviewFor(appointmentId: string): boolean {
    return this.store.getSnapshot().some((review) => review.appointmentId === appointmentId);
  }

  add(input: NewReview): UserReview {
    if (!isValidStars(input.stars)) throw new Error('Stars must be a whole number from 1 to 5');
    const review: UserReview = {
      ...input,
      id: `rev_${this.clock.now().getTime().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    };
    this.store.update((all) => [...all, review]);
    return review;
  }
}
