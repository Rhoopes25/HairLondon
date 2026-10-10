import type { Clock } from '../clock';
import type { ServiceCatalog, ServiceId } from '../models/service';
import type { Stylist } from '../models/stylist';
import { durationMin } from '../models/time';
import type { DurationMin, IsoDate } from '../models/time';
import { totalDuration } from '../pricing/totals';
import type { AvailabilityStrategy } from '../scheduling/availability';
import { findOpenings } from '../scheduling/search';
import type { Opening, TimeOfDay } from '../scheduling/search';
import { bookableDays } from '../scheduling/slots';
import { stylistsOffering } from './filter';

/** What the client asked for on the Book page. Every part is optional: she can just look. */
export interface BookSearch {
  readonly serviceIds: readonly ServiceId[];
  readonly day?: IsoDate | undefined;
  readonly timeOfDay?: TimeOfDay | undefined;
}

/** With no service chosen yet, openings are checked for an hour, the most common visit. */
export const DEFAULT_VISIT: DurationMin = durationMin(60);

/** How many next-open times each stylist's card shows. */
export const OPENINGS_PER_CARD = 3;

/** How many days the Book page's day strip offers. */
const DAY_STRIP_LENGTH = 14;

export interface StylistMatch {
  readonly stylist: Stylist;
  readonly openings: readonly Opening[];
}

export interface SearchOutcome {
  /** Everyone who offers every chosen service, whether or not she has an opening. */
  readonly offering: readonly Stylist[];
  /** Offering stylists with an opening that fits the day and time asked for. */
  readonly matches: readonly StylistMatch[];
  /** When a day or time was asked for and nobody fits: their soonest times instead. */
  readonly alternatives: readonly StylistMatch[];
}

export interface SearchEnvironment {
  readonly catalog: ServiceCatalog;
  readonly strategy: AvailabilityStrategy;
  readonly clock: Clock;
}

export function isTimed(search: BookSearch): boolean {
  return search.day !== undefined || search.timeOfDay !== undefined;
}

/** The length of visit the search checks openings for. */
export function visitLength(catalog: ServiceCatalog, serviceIds: readonly ServiceId[]): DurationMin {
  return serviceIds.length ? totalDuration(catalog, serviceIds) : DEFAULT_VISIT;
}

function matchesFor(
  stylists: readonly Stylist[],
  length: DurationMin,
  env: SearchEnvironment,
  when: Pick<BookSearch, 'day' | 'timeOfDay'>,
): StylistMatch[] {
  return stylists
    .map((stylist) => ({
      stylist,
      openings: findOpenings(
        { strategy: env.strategy, clock: env.clock, stylistId: stylist.id },
        stylist.workDays,
        length,
        { ...when, limit: OPENINGS_PER_CARD },
      ),
    }))
    .filter((match) => match.openings.length > 0);
}

function soonestFirst(a: StylistMatch, b: StylistMatch): number {
  const x = a.openings[0];
  const y = b.openings[0];
  if (!x || !y) return 0;
  return x.date.localeCompare(y.date) || x.start - y.start;
}

/**
 * Who can fit her in. With only services chosen, stylists keep their usual order; once she picks
 * a day or time, the soonest opening comes first. If nobody fits that day or time, the soonest
 * times they do have come back as alternatives, so she is never left at a dead end.
 */
export function searchStylists(
  stylists: readonly Stylist[],
  search: BookSearch,
  env: SearchEnvironment,
): SearchOutcome {
  const offering = stylistsOffering(stylists, search.serviceIds);
  const length = visitLength(env.catalog, search.serviceIds);
  const timed = isTimed(search);

  const matches = matchesFor(offering, length, env, search);
  if (timed) matches.sort(soonestFirst);

  const alternatives = timed && !matches.length ? matchesFor(offering, length, env, {}) : [];
  return { offering, matches, alternatives };
}

/** The days the Book page offers: ones at least one stylist works, soonest first. */
export function searchableDays(clock: Clock, stylists: readonly Stylist[]): IsoDate[] {
  const workDays = [...new Set(stylists.flatMap((stylist) => stylist.workDays))];
  return bookableDays(clock, workDays).slice(0, DAY_STRIP_LENGTH);
}
