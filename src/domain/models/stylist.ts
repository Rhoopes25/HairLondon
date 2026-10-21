import type { Review } from './review';
import type { ServiceId } from './service';
import type { Weekday } from './time';

export interface PortfolioPhoto {
  /** Path relative to the app's public folder, e.g. "images/work-1.png". */
  readonly src: string;
  readonly alt: string;
}

/** Where her chair is. Sample data: the addresses are made up for the prototype. */
export interface StudioLocation {
  readonly address: string;
  readonly lat: number;
  readonly lng: number;
}

export interface Stylist {
  readonly id: string;
  readonly name: string;
  readonly studio: string;
  readonly city: string;
  /** Path relative to the app's public folder, or null if she has not added one. */
  readonly photo: string | null;
  readonly bio: string;
  /** "Get to know me": a few lines in her own voice, for the About me tab. */
  readonly story: string;
  readonly yearsDoingHair: number;
  readonly specialties: readonly string[];
  readonly location: StudioLocation;
  readonly workDays: readonly Weekday[];
  /** A service missing here is a service she does not offer. */
  readonly prices: Readonly<Partial<Record<ServiceId, number>>>;
  readonly portfolio: readonly PortfolioPhoto[];
  readonly reviews: readonly Review[];
}
