import type { Review } from './review';
import type { ServiceId } from './service';
import type { Weekday } from './time';

export interface PortfolioPhoto {
  /** Path relative to the app's public folder, e.g. "images/work-1.png". */
  readonly src: string;
  readonly alt: string;
}

export interface Stylist {
  readonly id: string;
  readonly name: string;
  readonly studio: string;
  readonly city: string;
  /** Path relative to the app's public folder, or null if she has not added one. */
  readonly photo: string | null;
  readonly bio: string;
  readonly workDays: readonly Weekday[];
  /** A service missing here is a service she does not offer. */
  readonly prices: Readonly<Partial<Record<ServiceId, number>>>;
  readonly portfolio: readonly PortfolioPhoto[];
  readonly reviews: readonly Review[];
}
