import type { ServiceCatalog, ServiceId } from '../models/service';
import { sumDurations } from '../models/time';
import type { DurationMin } from '../models/time';
import type { Stylist } from '../models/stylist';

export function offersService(stylist: Pick<Stylist, 'prices'>, id: ServiceId): boolean {
  return stylist.prices[id] !== undefined;
}

/** Sum of the stylist's prices. Throws if a service is not one she offers: that is a bug, not a user error. */
export function totalPrice(
  stylist: Pick<Stylist, 'prices' | 'name'>,
  ids: readonly ServiceId[],
): number {
  return ids.reduce((sum, id) => {
    const price = stylist.prices[id];
    if (price === undefined) throw new Error(`${stylist.name} does not offer "${id}"`);
    return sum + price;
  }, 0);
}

export function totalDuration(catalog: ServiceCatalog, ids: readonly ServiceId[]): DurationMin {
  return sumDurations(ids.map((id) => catalog[id].durationMin));
}

/** Her lowest price, or null if she lists no services yet. */
export function startingPrice(stylist: Pick<Stylist, 'prices'>): number | null {
  const prices = Object.values(stylist.prices).filter((p): p is number => p !== undefined);
  return prices.length ? Math.min(...prices) : null;
}

/** Lowest and highest price for a service across the stylists who offer it. */
export function priceRange(
  stylists: readonly Pick<Stylist, 'prices'>[],
  id: ServiceId,
): { min: number; max: number } | null {
  const prices = stylists.map((s) => s.prices[id]).filter((p): p is number => p !== undefined);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null;
}
