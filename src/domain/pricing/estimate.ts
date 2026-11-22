import type { ServiceId } from '../models/service';
import type { Stylist } from '../models/stylist';
import { stylistsOffering } from '../stylists/filter';
import { totalPrice } from './totals';

/** What a set of services costs across the stylists who do all of them. */
export interface PriceEstimate {
  /** The lowest starting total. */
  readonly min: number;
  /** The highest starting total. Equal to `min` when everyone charges the same. */
  readonly max: number;
  /** How many stylists offer every one of the services. */
  readonly stylistCount: number;
}

/**
 * The Book page's running total. Each stylist sets her own prices, so before she has picked one
 * the honest answer is a range: from what the least expensive of them charges for these services
 * to the most. Null when nobody offers them all together (or nothing is picked yet).
 */
export function estimateAcrossStylists(
  stylists: readonly Stylist[],
  serviceIds: readonly ServiceId[],
): PriceEstimate | null {
  if (!serviceIds.length) return null;
  const totals = stylistsOffering(stylists, serviceIds).map((stylist) =>
    totalPrice(stylist, serviceIds),
  );
  if (!totals.length) return null;
  return { min: Math.min(...totals), max: Math.max(...totals), stylistCount: totals.length };
}
