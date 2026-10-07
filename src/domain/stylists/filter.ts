import type { ServiceId } from '../models/service';
import type { Stylist } from '../models/stylist';
import type { Weekday } from '../models/time';
import { offersService } from '../pricing/totals';

export interface StylistFilter {
  /** Only stylists who offer this service. */
  readonly service?: ServiceId | undefined;
  /** Only stylists who work this day of the week. */
  readonly weekday?: Weekday | undefined;
}

export function filterStylists(stylists: readonly Stylist[], filter: StylistFilter): Stylist[] {
  return stylists.filter(
    (stylist) =>
      (filter.service === undefined || offersService(stylist, filter.service)) &&
      (filter.weekday === undefined || stylist.workDays.includes(filter.weekday)),
  );
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

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6;
}

/** Parses a ?day= query value ("0" to "6"); anything else means "no day filter". */
export function parseWeekday(value: string | null | undefined): Weekday | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return isWeekday(n) ? n : undefined;
}

/** "Tuesday, Wednesday, and Friday" */
export function describeWorkDays(days: readonly Weekday[]): string {
  const names = [...days].sort((a, b) => a - b).map((day) => WEEKDAY_NAMES[day]);
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}
