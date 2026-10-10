import { isServiceId } from '../models/service';
import type { ServiceId } from '../models/service';
import type { Stylist } from '../models/stylist';
import type { Weekday } from '../models/time';
import { offersService } from '../pricing/totals';

/** Stylists who offer every one of these services. No services means everyone. */
export function stylistsOffering(
  stylists: readonly Stylist[],
  serviceIds: readonly ServiceId[],
): Stylist[] {
  return stylists.filter((stylist) => serviceIds.every((id) => offersService(stylist, id)));
}

/**
 * Valid service ids from a comma-separated query value ("haircut,color"), in the order given,
 * with unknown and repeated ids dropped. Links are typed and shared, so nothing here may throw.
 */
export function parseServiceIds(value: string | null | undefined): ServiceId[] {
  if (!value) return [];
  const seen = new Set<ServiceId>();
  for (const part of value.split(',')) {
    const id = part.trim();
    if (isServiceId(id)) seen.add(id);
  }
  return [...seen];
}

export function serviceIdsParam(serviceIds: readonly ServiceId[]): string {
  return serviceIds.join(',');
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** "Tuesday, Wednesday, and Friday" */
export function describeWorkDays(days: readonly Weekday[]): string {
  const names = [...days].sort((a, b) => a - b).map((day) => WEEKDAY_NAMES[day]);
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}
