import { isSpecialtyArea } from '../models/specialty';
import type { SpecialtyArea } from '../models/specialty';
import type { Stylist } from '../models/stylist';
import { startingPrice } from '../pricing/totals';
import { milesBetween, sortByDistance } from './location';
import type { GeoPoint } from './location';

/**
 * How the Stylists page can order its list. `best` keeps the order it is given (the best text
 * match while she is searching), so it is only offered then.
 */
export const SORT_KEYS = ['best', 'nearest', 'price'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  best: 'Best match',
  nearest: 'Nearest',
  price: 'Lowest price',
};

/**
 * The "up to" choices for her starting price and for how far away she is. Fixed lists, not free
 * numbers, so a shared link can only ever say something the page knows how to show.
 */
export const PRICE_LIMITS = [25, 35] as const;
export const DISTANCE_LIMITS = [5, 10, 20] as const;
export type PriceLimit = (typeof PRICE_LIMITS)[number];
export type DistanceLimit = (typeof DISTANCE_LIMITS)[number];

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === 'string' && (SORT_KEYS as readonly string[]).includes(value);
}

export function isPriceLimit(value: number): value is PriceLimit {
  return (PRICE_LIMITS as readonly number[]).includes(value);
}

export function isDistanceLimit(value: number): value is DistanceLimit {
  return (DISTANCE_LIMITS as readonly number[]).includes(value);
}

export interface BrowseOptions {
  readonly sort?: SortKey | undefined;
  /** Her lowest price is at most this much. */
  readonly maxPrice?: PriceLimit | undefined;
  /** Her chair is at most this many miles away. */
  readonly maxMiles?: DistanceLimit | undefined;
  /** She is known for this. */
  readonly area?: SpecialtyArea | undefined;
}

/** How many of the four choices are narrowing the list (sorting does not narrow it). */
export function activeFilterCount(options: BrowseOptions): number {
  return [options.maxPrice, options.maxMiles, options.area].filter((value) => value !== undefined)
    .length;
}

/** Her lowest price first. A stylist with no prices yet goes last. Stable for ties. */
function sortByPrice(stylists: readonly Stylist[]): Stylist[] {
  return stylists
    .map((stylist, index) => ({ stylist, index, price: startingPrice(stylist) ?? Infinity }))
    .sort((a, b) => a.price - b.price || a.index - b.index)
    .map(({ stylist }) => stylist);
}

/**
 * Narrow the list by specialty, starting price, and distance, then order it. Every part is
 * optional, and with nothing chosen the list comes back as it was given.
 */
export function browseStylists(
  stylists: readonly Stylist[],
  options: BrowseOptions,
  from: GeoPoint,
): Stylist[] {
  const { sort, maxPrice, maxMiles, area } = options;
  const kept = stylists.filter((stylist) => {
    if (area !== undefined && !stylist.areas.includes(area)) return false;
    if (maxPrice !== undefined) {
      const lowest = startingPrice(stylist);
      if (lowest === null || lowest > maxPrice) return false;
    }
    if (maxMiles !== undefined && milesBetween(from, stylist.location) > maxMiles) return false;
    return true;
  });
  if (sort === 'nearest') return sortByDistance(kept, from);
  if (sort === 'price') return sortByPrice(kept);
  return kept;
}

/** Reads the four choices out of query-string values, ignoring anything it does not recognize. */
export function parseBrowse(values: {
  sort?: string | null;
  price?: string | null;
  within?: string | null;
  area?: string | null;
}): BrowseOptions {
  const price = Number(values.price);
  const within = Number(values.within);
  return {
    sort: isSortKey(values.sort) ? values.sort : undefined,
    maxPrice: isPriceLimit(price) ? price : undefined,
    maxMiles: isDistanceLimit(within) ? within : undefined,
    area: isSpecialtyArea(values.area) ? values.area : undefined,
  };
}
